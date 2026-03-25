import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  ridersTable,
  ordersTable,
  orderItemsTable,
  branchesTable,
  orderStatusHistoryTable,
  orderMessagesTable,
  couponsTable,
} from "@workspace/db/schema";
import { eq, desc, count, sum, gte, and, inArray } from "drizzle-orm";
import crypto from "crypto";
import { emitOrderStatusUpdate } from "../websocket.js";

const router = Router();

function hashPassword(pw: string): string {
  return crypto.createHash("sha256").update(pw + "seagull_salt").digest("hex");
}

interface AdminSession {
  userId: number | null;
  branchId: number | null;
  email: string;
}

const sessions = new Map<string, AdminSession>();

const SUPER_ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@seagull.com";
const SUPER_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "SeaGull@Admin2025!";

function requireAdmin(req: any, res: any, next: any) {
  const auth = req.headers.authorization ?? "";
  const token = auth.replace("Bearer ", "").trim();
  const session = sessions.get(token);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.adminSession = session;
  next();
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
    const token = "sadmin-" + crypto.randomBytes(24).toString("hex");
    sessions.set(token, { userId: null, branchId: null, email });
    return res.json({ token, branchId: null, email, isSuperAdmin: true });
  }

  const pwHash = hashPassword(password);
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user || user.role !== "admin" || user.passwordHash !== pwHash) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = "admin-" + crypto.randomBytes(24).toString("hex");
  sessions.set(token, { userId: user.id, branchId: user.branchId ?? null, email });

  const branch = user.branchId
    ? await db.select().from(branchesTable).where(eq(branchesTable.id, user.branchId)).limit(1).then(r => r[0])
    : null;

  return res.json({ token, branchId: user.branchId ?? null, branchName: branch?.name ?? null, email, isSuperAdmin: false });
});

router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const session: AdminSession = req.adminSession;
    const branchId = session.branchId;

    const branchFilter = branchId ? eq(ordersTable.branchId, branchId) : undefined;
    const branchAndDate = branchId
      ? and(gte(ordersTable.createdAt, startOfDay), eq(ordersTable.branchId, branchId))
      : gte(ordersTable.createdAt, startOfDay);

    const [totalOrdersRow] = await db.select({ count: count() }).from(ordersTable).where(branchFilter);
    const [todayOrdersRow] = await db.select({ count: count() }).from(ordersTable).where(branchAndDate);
    const [todayRevenueRow] = await db.select({ total: sum(ordersTable.total) }).from(ordersTable).where(branchAndDate);
    const [activeRidersRow] = await db.select({ count: count() }).from(ridersTable).where(eq(ridersTable.status, "available" as any));
    const [onlineRidersRow] = await db.select({ count: count() }).from(ridersTable).where(eq(ridersTable.status, "busy" as any));
    const [totalRidersRow] = await db.select({ count: count() }).from(ridersTable);

    res.json({
      totalOrders: Number(totalOrdersRow.count),
      todayOrders: Number(todayOrdersRow.count),
      todayRevenue: Number(todayRevenueRow.total ?? 0),
      availableRiders: Number(activeRidersRow.count),
      deliveringRiders: Number(onlineRidersRow.count),
      totalRiders: Number(totalRidersRow.count),
      branchId: branchId ?? null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/orders", requireAdmin, async (req, res) => {
  try {
    const session: AdminSession = req.adminSession;
    const branchId = session.branchId;
    const branchFilter = branchId ? eq(ordersTable.branchId, branchId) : undefined;

    const orders = await db
      .select()
      .from(ordersTable)
      .where(branchFilter)
      .orderBy(desc(ordersTable.createdAt))
      .limit(100);

    const enriched = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, order.id));

        const [user] = await db
          .select({ id: usersTable.id, name: usersTable.name, phone: usersTable.phone })
          .from(usersTable)
          .where(eq(usersTable.id, order.userId))
          .limit(1);

        let rider = null;
        if (order.riderId) {
          const [riderRow] = await db
            .select()
            .from(ridersTable)
            .where(eq(ridersTable.id, order.riderId))
            .limit(1);
          if (riderRow) {
            const [riderUser] = await db
              .select({ name: usersTable.name, phone: usersTable.phone })
              .from(usersTable)
              .where(eq(usersTable.id, riderRow.userId))
              .limit(1);
            rider = { ...riderRow, user: riderUser };
          }
        }

        return { ...order, items, user, rider };
      })
    );

    res.json(enriched);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.patch("/orders/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = Number(req.params.id);

    await db
      .update(ordersTable)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(ordersTable.id, orderId));

    await db.insert(orderStatusHistoryTable).values({
      orderId,
      status: status as any,
      note: "Updated by admin",
    });

    emitOrderStatusUpdate(orderId, status);

    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

router.patch("/orders/:id/assign-rider", requireAdmin, async (req, res) => {
  try {
    const { riderId } = req.body;
    const orderId = Number(req.params.id);

    await db
      .update(ordersTable)
      .set({ riderId: riderId as any, updatedAt: new Date() })
      .where(eq(ordersTable.id, orderId));

    if (riderId) {
      await db
        .update(ridersTable)
        .set({ status: "busy" as any })
        .where(eq(ridersTable.id, riderId));
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to assign rider" });
  }
});

router.get("/riders", requireAdmin, async (req, res) => {
  try {
    const session = sessions.get(req.headers["x-admin-token"] as string);
    const adminBranchId = session?.branchId ?? null;

    const allRiders = await db.select().from(ridersTable).orderBy(desc(ridersTable.createdAt));
    const filtered = adminBranchId
      ? allRiders.filter(r => r.branchId === adminBranchId)
      : allRiders;

    const enriched = await Promise.all(
      filtered.map(async (rider) => {
        const [user] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, rider.userId))
          .limit(1);
        const [branch] = rider.branchId
          ? await db.select().from(branchesTable).where(eq(branchesTable.id, rider.branchId)).limit(1)
          : [null];
        return { ...rider, user, branch };
      })
    );

    res.json(enriched);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch riders" });
  }
});

router.patch("/riders/:id/password", requireAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 4) return res.status(400).json({ error: "Password must be at least 4 characters" });
    await db.update(ridersTable).set({ loginPassword: password }).where(eq(ridersTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

router.post("/riders", requireAdmin, async (req, res) => {
  try {
    const session = sessions.get(req.headers["x-admin-token"] as string);
    const adminBranchId = session?.branchId ?? null;

    const { name, phone, vehicleType, vehiclePlate, loginPassword, branchId: bodyBranchId } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    // Branch admins always create riders for their own branch; super admin can specify
    const assignedBranchId = adminBranchId ?? bodyBranchId ?? null;

    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone, phone))
      .limit(1);

    let userId: number;
    if (existing) {
      userId = existing.id;
      await db.update(usersTable).set({ role: "rider" as any }).where(eq(usersTable.id, userId));
    } else {
      const [newUser] = await db
        .insert(usersTable)
        .values({ name, phone, role: "rider" as any })
        .returning({ id: usersTable.id });
      userId = newUser.id;
    }

    const existingRider = await db
      .select()
      .from(ridersTable)
      .where(eq(ridersTable.userId, userId))
      .limit(1);

    if (existingRider.length > 0) {
      return res.status(409).json({ error: "This phone number is already registered as a rider" });
    }

    const [rider] = await db
      .insert(ridersTable)
      .values({
        userId,
        phone: phone ?? null,
        branchId: assignedBranchId,
        vehicleType: vehicleType ?? "motorcycle",
        vehiclePlate: vehiclePlate ?? "",
        status: "offline" as any,
        isVerified: true,
        loginPassword: loginPassword ?? null,
      })
      .returning();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    res.status(201).json({ ...rider, user });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create rider" });
  }
});

router.patch("/riders/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await db
      .update(ridersTable)
      .set({ status: status as any })
      .where(eq(ridersTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update rider status" });
  }
});

router.delete("/orders/:id", requireAdmin, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    await db.delete(orderMessagesTable).where(eq(orderMessagesTable.orderId, orderId));
    await db.delete(orderStatusHistoryTable).where(eq(orderStatusHistoryTable.orderId, orderId));
    await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
    await db.delete(ordersTable).where(eq(ordersTable.id, orderId));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

router.delete("/orders", requireAdmin, async (req, res) => {
  try {
    const session = sessions.get(req.headers["x-admin-token"] as string);
    const adminBranchId = session?.branchId ?? null;
    const { status } = req.query as { status?: string };

    let allOrders = await db.select({ id: ordersTable.id, branchId: ordersTable.branchId, status: ordersTable.status }).from(ordersTable);
    if (adminBranchId) allOrders = allOrders.filter(o => o.branchId === adminBranchId);
    if (status) allOrders = allOrders.filter(o => o.status === status);

    const ids = allOrders.map(o => o.id);
    if (ids.length > 0) {
      await db.delete(orderMessagesTable).where(inArray(orderMessagesTable.orderId, ids));
      await db.delete(orderStatusHistoryTable).where(inArray(orderStatusHistoryTable.orderId, ids));
      await db.delete(orderItemsTable).where(inArray(orderItemsTable.orderId, ids));
      await db.delete(ordersTable).where(inArray(ordersTable.id, ids));
    }
    res.json({ success: true, deleted: ids.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete orders" });
  }
});

router.patch("/orders/cancel-all", requireAdmin, async (req, res) => {
  try {
    const session = sessions.get(req.headers["x-admin-token"] as string);
    const adminBranchId = session?.branchId ?? null;

    const TERMINAL = ["delivered", "completed", "cancelled"];
    let allOrders = await db
      .select({ id: ordersTable.id, branchId: ordersTable.branchId, status: ordersTable.status })
      .from(ordersTable);

    const toCancel = allOrders.filter(o => {
      const branchOk = adminBranchId ? o.branchId === adminBranchId : true;
      const notTerminal = !TERMINAL.includes(o.status as string);
      return branchOk && notTerminal;
    });

    if (toCancel.length > 0) {
      const ids = toCancel.map(o => o.id);
      await db.update(ordersTable).set({ status: "cancelled" as any, updatedAt: new Date() }).where(inArray(ordersTable.id, ids));
    }
    res.json({ success: true, cancelled: toCancel.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to cancel orders" });
  }
});

router.delete("/riders/:id", requireAdmin, async (req, res) => {
  try {
    const [rider] = await db
      .select()
      .from(ridersTable)
      .where(eq(ridersTable.id, Number(req.params.id)))
      .limit(1);

    if (!rider) return res.status(404).json({ error: "Rider not found" });

    await db.delete(ridersTable).where(eq(ridersTable.id, Number(req.params.id)));

    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete rider" });
  }
});

// ─── Coupon Management ─────────────────────────────────────────────────────────

router.get("/coupons", requireAdmin, async (req, res) => {
  try {
    const coupons = await db
      .select()
      .from(couponsTable)
      .orderBy(desc(couponsTable.createdAt));
    res.json(coupons);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

router.post("/coupons", requireAdmin, async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, expiresAt } = req.body;
    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ error: "code, discountType and discountValue are required" });
    }
    const [coupon] = await db
      .insert(couponsTable)
      .values({
        code: String(code).toUpperCase().trim(),
        description: description || null,
        discountType,
        discountValue: String(discountValue),
        minOrderAmount: minOrderAmount ? String(minOrderAmount) : null,
        maxDiscount: maxDiscount ? String(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      })
      .returning();
    res.status(201).json(coupon);
  } catch (err: any) {
    req.log.error(err);
    if (err?.code === "23505") return res.status(409).json({ error: "Coupon code already exists" });
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

router.patch("/coupons/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { isActive, description, discountValue, minOrderAmount, maxDiscount, usageLimit, expiresAt } = req.body;
    const updates: Record<string, any> = {};
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (description !== undefined) updates.description = description;
    if (discountValue !== undefined) updates.discountValue = String(discountValue);
    if (minOrderAmount !== undefined) updates.minOrderAmount = minOrderAmount ? String(minOrderAmount) : null;
    if (maxDiscount !== undefined) updates.maxDiscount = maxDiscount ? String(maxDiscount) : null;
    if (usageLimit !== undefined) updates.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const [updated] = await db
      .update(couponsTable)
      .set(updates)
      .where(eq(couponsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Coupon not found" });
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update coupon" });
  }
});

router.delete("/coupons/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(couponsTable).where(eq(couponsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

export default router;
