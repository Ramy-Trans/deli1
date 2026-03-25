import { Router } from "express";
import { db } from "@workspace/db";
import {
  ordersTable,
  orderItemsTable,
  orderStatusHistoryTable,
  usersTable,
  branchesTable,
  ridersTable,
  orderMessagesTable,
} from "@workspace/db/schema";
import { eq, desc, and, asc } from "drizzle-orm";
import { getUserIdFromToken } from "../lib/auth.js";
import { emitOrderStatusUpdate, emitChatMessage } from "../websocket.js";
import crypto from "crypto";

const router = Router();

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `SG-${ts}-${rand}`;
}

router.get("/", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId))
      .orderBy(desc(ordersTable.createdAt));

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, order.id));

        const [branch] = await db
          .select()
          .from(branchesTable)
          .where(eq(branchesTable.id, order.branchId))
          .limit(1);

        return { ...order, items, branch };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(
        and(eq(ordersTable.id, Number(req.params.id)), eq(ordersTable.userId, userId))
      )
      .limit(1);

    if (!order) return res.status(404).json({ error: "Order not found" });

    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, order.id));

    const statusHistory = await db
      .select()
      .from(orderStatusHistoryTable)
      .where(eq(orderStatusHistoryTable.orderId, order.id))
      .orderBy(orderStatusHistoryTable.createdAt);

    const [branch] = await db
      .select()
      .from(branchesTable)
      .where(eq(branchesTable.id, order.branchId))
      .limit(1);

    let rider = null;
    if (order.riderId) {
      const [riderRow] = await db
        .select({
          rider: ridersTable,
          user: usersTable,
        })
        .from(ridersTable)
        .leftJoin(usersTable, eq(ridersTable.userId, usersTable.id))
        .where(eq(ridersTable.id, order.riderId))
        .limit(1);

      if (riderRow) {
        rider = {
          id: riderRow.rider.id,
          name: riderRow.user?.name ?? "Rider",
          phone: riderRow.rider.phone ?? riderRow.user?.phone,
          rating: riderRow.rider.rating,
          vehicleType: riderRow.rider.vehicleType,
          vehiclePlate: riderRow.rider.vehiclePlate,
          profileImageUrl: riderRow.rider.profileImageUrl,
          currentLatitude: riderRow.rider.currentLatitude,
          currentLongitude: riderRow.rider.currentLongitude,
        };
      }
    }

    res.json({ ...order, items, statusHistory, branch, rider });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const {
      branchId,
      items,
      paymentMethod,
      type,
      addressId,
      deliveryAddress,
      deliveryNotes,
      specialInstructions,
      couponCode,
      loyaltyPointsToUse,
      tip,
      subtotal,
      deliveryFee,
      serviceFee,
      tax,
      total,
      scheduledFor,
      isContactless,
      deliveryLatitude,
      deliveryLongitude,
    } = req.body;

    const discount = loyaltyPointsToUse ? loyaltyPointsToUse * 0.1 : 0;
    const loyaltyEarned = Math.floor(total * 0.1);

    const [order] = await db
      .insert(ordersTable)
      .values({
        orderNumber: generateOrderNumber(),
        userId,
        branchId,
        type: type ?? "delivery",
        status: paymentMethod === "cash" ? "accepted" : "payment_pending",
        addressId,
        deliveryAddress,
        deliveryNotes,
        specialInstructions,
        couponCode,
        loyaltyPointsUsed: loyaltyPointsToUse ?? 0,
        loyaltyPointsEarned: loyaltyEarned,
        tip: tip?.toString() ?? "0",
        subtotal: subtotal.toString(),
        deliveryFee: (deliveryFee ?? 0).toString(),
        serviceFee: (serviceFee ?? 0).toString(),
        tax: (tax ?? 0).toString(),
        discount: discount.toString(),
        total: total.toString(),
        isContactless: isContactless ?? false,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        estimatedDeliveryTime: new Date(Date.now() + 35 * 60 * 1000),
        deliveryLatitude: deliveryLatitude ? deliveryLatitude.toString() : null,
        deliveryLongitude: deliveryLongitude ? deliveryLongitude.toString() : null,
      })
      .returning();

    if (items?.length > 0) {
      await db.insert(orderItemsTable).values(
        items.map((item: any) => ({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          variantName: item.variantName,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          totalPrice: (item.quantity * item.unitPrice).toString(),
          addOns: item.addOns ?? [],
          specialInstructions: item.specialInstructions,
        }))
      );
    }

    await db.insert(orderStatusHistoryTable).values({
      orderId: order.id,
      status: order.status,
      note: "Order placed successfully",
    });

    if (loyaltyPointsToUse && loyaltyPointsToUse > 0) {
      await db
        .update(usersTable)
        .set({
          loyaltyPoints: db
            .select({ points: usersTable.loyaltyPoints })
            .from(usersTable)
            .where(eq(usersTable.id, userId)) as any,
        })
        .where(eq(usersTable.id, userId));
    }

    const orderWithItems = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, order.id))
      .limit(1);

    const orderItems = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, order.id));

    const [branch] = await db
      .select()
      .from(branchesTable)
      .where(eq(branchesTable.id, order.branchId))
      .limit(1);

    res.json({ ...orderWithItems[0], items: orderItems, branch });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

const ORDER_STATUSES = [
  "payment_pending",
  "accepted",
  "preparing",
  "ready",
  "on_the_way",
  "delivered",
];

router.patch("/:id/status", async (req, res) => {
  try {
    const { status, note } = req.body;

    const [order] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, Number(req.params.id)))
      .returning();

    if (!order) return res.status(404).json({ error: "Order not found" });

    await db.insert(orderStatusHistoryTable).values({
      orderId: order.id,
      status,
      note: note ?? `Order status updated to ${status}`,
    });

    emitOrderStatusUpdate(order.id, status);

    res.json(order);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.post("/:id/simulate", async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    const [current] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (!current) return res.status(404).json({ error: "Order not found" });

    const currentIndex = ORDER_STATUSES.indexOf(current.status);
    const nextStatus =
      currentIndex >= 0 && currentIndex < ORDER_STATUSES.length - 1
        ? ORDER_STATUSES[currentIndex + 1]
        : current.status;

    if (nextStatus === current.status) {
      return res.json({ message: "Already at final status", order: current });
    }

    const [updated] = await db
      .update(ordersTable)
      .set({ status: nextStatus })
      .where(eq(ordersTable.id, orderId))
      .returning();

    await db.insert(orderStatusHistoryTable).values({
      orderId,
      status: nextStatus,
      note: getStatusNote(nextStatus),
    });

    emitOrderStatusUpdate(orderId, nextStatus);

    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to simulate status" });
  }
});

function getStatusNote(status: string): string {
  const notes: Record<string, string> = {
    accepted: "Your order has been accepted by the restaurant",
    preparing: "The kitchen is preparing your order",
    ready: "Your order is ready and waiting for pickup",
    on_the_way: "Your rider has picked up your order",
    delivered: "Your order has been delivered. Enjoy!",
    cancelled: "Order cancelled",
    near_customer: "Your rider is almost there!",
  };
  return notes[status] ?? `Status updated to ${status}`;
}

router.get("/:id/messages", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [order] = await db
      .select({ id: ordersTable.id })
      .from(ordersTable)
      .where(and(eq(ordersTable.id, Number(req.params.id)), eq(ordersTable.userId, userId)))
      .limit(1);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const msgs = await db
      .select()
      .from(orderMessagesTable)
      .where(eq(orderMessagesTable.orderId, order.id))
      .orderBy(asc(orderMessagesTable.createdAt));

    res.json(msgs);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/:id/messages", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [order] = await db
      .select({ id: ordersTable.id })
      .from(ordersTable)
      .where(and(eq(ordersTable.id, Number(req.params.id)), eq(ordersTable.userId, userId)))
      .limit(1);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const [user] = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Message required" });

    const [msg] = await db
      .insert(orderMessagesTable)
      .values({
        orderId: order.id,
        senderType: "customer",
        senderId: userId,
        senderName: user?.name ?? "Customer",
        message: message.trim(),
      })
      .returning();

    emitChatMessage(order.id, msg);
    res.json(msg);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

router.post("/:id/cancel", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [order] = await db
      .update(ordersTable)
      .set({ status: "cancelled", cancellationReason: req.body.reason })
      .where(
        and(eq(ordersTable.id, Number(req.params.id)), eq(ordersTable.userId, userId))
      )
      .returning();

    if (!order) return res.status(404).json({ error: "Order not found" });

    await db.insert(orderStatusHistoryTable).values({
      orderId: order.id,
      status: "cancelled",
      note: req.body.reason ?? "Cancelled by customer",
    });

    res.json(order);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

export default router;
