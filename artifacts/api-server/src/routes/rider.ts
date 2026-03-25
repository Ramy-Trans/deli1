import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  ridersTable,
  ordersTable,
  orderItemsTable,
  orderStatusHistoryTable,
  orderMessagesTable,
} from "@workspace/db/schema";
import { eq, desc, isNull, or, and, inArray, asc } from "drizzle-orm";
import crypto from "crypto";
import { emitOrderStatusUpdate, emitDriverAssigned, emitRiderLocation, emitChatMessage } from "../websocket.js";

const router = Router();

function makeRiderToken(riderId: number, phone: string, password: string) {
  const hash = crypto
    .createHash("sha256")
    .update(`${riderId}|${phone}|${password}`)
    .digest("hex")
    .slice(0, 24);
  return `rider-${riderId}-${hash}`;
}

async function getRiderFromToken(token: string): Promise<{ rider: any; user: any } | null> {
  if (!token?.startsWith("rider-")) return null;
  const parts = token.split("-");
  const riderId = Number(parts[1]);
  if (!riderId) return null;
  const [rider] = await db.select().from(ridersTable).where(eq(ridersTable.id, riderId)).limit(1);
  if (!rider) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, rider.userId)).limit(1);
  if (!user) return null;
  const expected = makeRiderToken(riderId, user.phone, rider.loginPassword ?? "");
  if (token !== expected) return null;
  return { rider, user };
}

function requireRider(req: any, res: any, next: any) {
  const auth = req.headers.authorization?.replace("Bearer ", "") ?? "";
  getRiderFromToken(auth).then((result) => {
    if (!result) return res.status(401).json({ error: "Unauthorized" });
    req.rider = result.rider;
    req.riderUser = result.user;
    next();
  });
}

/**
 * GET /api/rider/driver-location?riderId=
 * Returns the last known position of a rider by their DB id.
 * Mirrors the reference /driver-location endpoint.
 */
router.get("/driver-location", async (req, res) => {
  try {
    const riderId = Number(req.query.riderId);
    if (!riderId) return res.status(400).json({ error: "riderId required" });

    const [rider] = await db
      .select({
        id: ridersTable.id,
        currentLatitude: ridersTable.currentLatitude,
        currentLongitude: ridersTable.currentLongitude,
        status: ridersTable.status,
      })
      .from(ridersTable)
      .where(eq(ridersTable.id, riderId))
      .limit(1);

    if (!rider) return res.status(404).json({ error: "Rider not found" });

    res.json({
      riderId,
      lat: rider.currentLatitude ? parseFloat(rider.currentLatitude) : null,
      lng: rider.currentLongitude ? parseFloat(rider.currentLongitude) : null,
      status: rider.status,
    });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to get driver location" });
  }
});

/**
 * POST /api/rider/update-location
 * Body: { riderId, lat, lng, orderId? }
 * REST-based location push — no WebSocket required from the caller.
 * Updates DB and broadcasts via WebSocket to any watchers.
 * Mirrors the reference /update-location endpoint.
 */
router.post("/update-location", async (req, res) => {
  try {
    const { riderId, lat, lng, orderId } = req.body;
    if (!riderId || lat == null || lng == null) {
      return res.status(400).json({ error: "riderId, lat, lng are required" });
    }

    await db
      .update(ridersTable)
      .set({
        currentLatitude: String(lat),
        currentLongitude: String(lng),
      })
      .where(eq(ridersTable.id, Number(riderId)));

    const targetOrderId = orderId
      ? Number(orderId)
      : await (async () => {
          const [activeOrder] = await db
            .select({ id: ordersTable.id })
            .from(ordersTable)
            .where(
              and(
                eq(ordersTable.riderId, Number(riderId)),
                inArray(ordersTable.status, [
                  "rider_assigned",
                  "picked_up",
                  "on_the_way",
                  "near_customer",
                ] as any[])
              )
            )
            .limit(1);
          return activeOrder?.id ?? null;
        })();

    if (targetOrderId) {
      emitRiderLocation(targetOrderId, {
        latitude: lat,
        longitude: lng,
        timestamp: Date.now(),
      });
    }

    res.json({ success: true, orderId: targetOrderId });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to update location" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: "Phone and password are required" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
    if (!user) return res.status(401).json({ error: "Invalid phone number or password" });

    const [rider] = await db.select().from(ridersTable).where(eq(ridersTable.userId, user.id)).limit(1);
    if (!rider) return res.status(401).json({ error: "No rider account found for this phone number" });
    if (!rider.loginPassword) return res.status(401).json({ error: "Rider password not set. Contact your admin." });
    if (rider.loginPassword !== password) return res.status(401).json({ error: "Invalid phone number or password" });

    const token = makeRiderToken(rider.id, user.phone, rider.loginPassword);

    await db.update(ridersTable).set({ status: "available" as any }).where(eq(ridersTable.id, rider.id));

    res.json({
      token,
      rider: {
        id: rider.id, vehicleType: rider.vehicleType, vehiclePlate: rider.vehiclePlate,
        status: "available", rating: rider.rating, totalDeliveries: rider.totalDeliveries,
        profileImageUrl: rider.profileImageUrl,
      },
      user: { id: user.id, name: user.name, phone: user.phone },
    });
  } catch (err: any) {
    req.log?.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", requireRider, (req: any, res) => {
  res.json({ rider: req.rider, user: req.riderUser });
});

router.patch("/location", requireRider, async (req: any, res) => {
  try {
    const { latitude, longitude } = req.body;
    await db
      .update(ridersTable)
      .set({ currentLatitude: String(latitude), currentLongitude: String(longitude) })
      .where(eq(ridersTable.id, req.rider.id));

    const [activeOrder] = await db
      .select()
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.riderId, req.rider.id),
          inArray(ordersTable.status, ["rider_assigned", "picked_up", "on_the_way", "near_customer"] as any[])
        )
      )
      .limit(1);

    if (activeOrder) {
      emitRiderLocation(activeOrder.id, {
        latitude,
        longitude,
        timestamp: Date.now(),
      });
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update location" });
  }
});

router.patch("/status", requireRider, async (req: any, res) => {
  try {
    const { status } = req.body;
    if (!["available", "offline", "busy"].includes(status)) return res.status(400).json({ error: "Invalid status" });
    await db.update(ridersTable).set({ status: status as any }).where(eq(ridersTable.id, req.rider.id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.get("/orders", requireRider, async (req: any, res) => {
  try {
    const allOrders = await db
      .select()
      .from(ordersTable)
      .where(
        or(
          eq(ordersTable.riderId, req.rider.id),
          isNull(ordersTable.riderId)
        )
      )
      .orderBy(desc(ordersTable.createdAt))
      .limit(50);

    const filtered = allOrders.filter((o) => {
      if (o.riderId === req.rider.id) return true;
      return (
        o.riderId === null &&
        ["placed", "accepted", "preparing", "packed", "waiting_rider"].includes(o.status)
      );
    });

    const enriched = await Promise.all(
      filtered.map(async (order) => {
        const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
        const [user] = await db
          .select({ name: usersTable.name, phone: usersTable.phone })
          .from(usersTable)
          .where(eq(usersTable.id, order.userId))
          .limit(1);
        return { ...order, items, user };
      })
    );

    res.json(enriched);
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.post("/orders/:id/accept", requireRider, async (req: any, res) => {
  try {
    const orderId = Number(req.params.id);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.riderId !== null && order.riderId !== req.rider.id) {
      return res.status(409).json({ error: "Order already assigned to another rider" });
    }

    await db
      .update(ordersTable)
      .set({ riderId: req.rider.id, status: "rider_assigned" as any, updatedAt: new Date() })
      .where(eq(ordersTable.id, orderId));

    await db.update(ridersTable).set({ status: "busy" as any }).where(eq(ridersTable.id, req.rider.id));

    await db.insert(orderStatusHistoryTable).values({
      orderId, status: "rider_assigned" as any, note: `Accepted by rider: ${req.riderUser.name}`,
    });

    emitDriverAssigned(orderId, {
      name: req.riderUser.name,
      phone: req.riderUser.phone,
      rating: req.rider.rating,
      vehicleType: req.rider.vehicleType,
      profileImageUrl: req.rider.profileImageUrl,
    });
    emitOrderStatusUpdate(orderId, "rider_assigned");

    res.json({ success: true });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to accept order" });
  }
});

router.patch("/orders/:id/status", requireRider, async (req: any, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.riderId !== req.rider.id) return res.status(403).json({ error: "Not your order" });

    await db
      .update(ordersTable)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(ordersTable.id, orderId));

    if (status === "delivered" || status === "completed") {
      await db
        .update(ridersTable)
        .set({ status: "available" as any, totalDeliveries: (req.rider.totalDeliveries ?? 0) + 1 })
        .where(eq(ridersTable.id, req.rider.id));
    }

    await db.insert(orderStatusHistoryTable).values({
      orderId, status: status as any, note: `Updated by rider: ${req.riderUser.name}`,
    });

    emitOrderStatusUpdate(orderId, status);

    res.json({ success: true });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

router.get("/orders/:id/messages", requireRider, async (req: any, res) => {
  try {
    const orderId = Number(req.params.id);
    const [order] = await db
      .select({ id: ordersTable.id })
      .from(ordersTable)
      .where(and(eq(ordersTable.id, orderId), eq(ordersTable.riderId, req.rider.id)))
      .limit(1);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const msgs = await db
      .select()
      .from(orderMessagesTable)
      .where(eq(orderMessagesTable.orderId, orderId))
      .orderBy(asc(orderMessagesTable.createdAt));

    res.json(msgs);
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/orders/:id/messages", requireRider, async (req: any, res) => {
  try {
    const orderId = Number(req.params.id);
    const [order] = await db
      .select({ id: ordersTable.id })
      .from(ordersTable)
      .where(and(eq(ordersTable.id, orderId), eq(ordersTable.riderId, req.rider.id)))
      .limit(1);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Message required" });

    const [msg] = await db
      .insert(orderMessagesTable)
      .values({
        orderId,
        senderType: "rider",
        senderId: req.rider.id,
        senderName: req.riderUser.name ?? "Rider",
        message: message.trim(),
      })
      .returning();

    emitChatMessage(orderId, msg);
    res.json(msg);
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

/**
 * POST /api/rider/update-location-by-phone
 * Body: { phone, lat, lng }
 * Allows a rider to update their location using their phone number (no auth token needed).
 * Useful for simple web-based rider tracking pages.
 */
router.post("/update-location-by-phone", async (req, res) => {
  try {
    const { phone, lat, lng } = req.body;
    if (!phone || lat == null || lng == null) {
      return res.status(400).json({ error: "phone, lat, lng are required" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone, String(phone)))
      .limit(1);

    if (!user) return res.status(404).json({ error: "No user found with this phone number" });

    const [rider] = await db
      .select()
      .from(ridersTable)
      .where(eq(ridersTable.userId, user.id))
      .limit(1);

    if (!rider) return res.status(404).json({ error: "No rider account linked to this phone number" });

    await db
      .update(ridersTable)
      .set({ currentLatitude: String(lat), currentLongitude: String(lng) })
      .where(eq(ridersTable.id, rider.id));

    const [activeOrder] = await db
      .select({ id: ordersTable.id })
      .from(ordersTable)
      .where(
        and(
          eq(ordersTable.riderId, rider.id),
          inArray(ordersTable.status, ["rider_assigned", "picked_up", "on_the_way", "near_customer"] as any[])
        )
      )
      .limit(1);

    if (activeOrder) {
      emitRiderLocation(activeOrder.id, { latitude: Number(lat), longitude: Number(lng), riderId: rider.id });
    }

    res.json({ success: true, riderId: rider.id, riderName: user.name, orderId: activeOrder?.id ?? null });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to update location" });
  }
});

export default router;
