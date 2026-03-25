import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  addressesTable,
  notificationsTable,
} from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUserIdFromToken } from "../lib/auth.js";

const router = Router();

router.get("/me", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) return res.status(404).json({ error: "User not found" });

    const { passwordHash, fcmToken, ...safe } = user;
    res.json(safe);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.patch("/me", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const allowed = ["name", "email", "avatarUrl", "preferredLanguage", "notificationPreferences"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const [updated] = await db
      .update(usersTable)
      .set(updates as any)
      .where(eq(usersTable.id, userId))
      .returning();

    if (!updated) return res.status(404).json({ error: "User not found" });

    const { passwordHash, fcmToken, ...safe } = updated;
    res.json(safe);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/me", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    await db.delete(usersTable).where(eq(usersTable.id, userId));
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

router.get("/addresses", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const addresses = await db
      .select()
      .from(addressesTable)
      .where(eq(addressesTable.userId, userId))
      .orderBy(desc(addressesTable.isDefault));

    res.json(addresses);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
});

router.post("/addresses", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const {
      label,
      address,
      area,
      city,
      latitude,
      longitude,
      landmark,
      floorApartment,
      isDefault,
    } = req.body;

    if (!address) return res.status(400).json({ error: "Address is required" });

    if (isDefault) {
      await db
        .update(addressesTable)
        .set({ isDefault: false })
        .where(eq(addressesTable.userId, userId));
    }

    const [newAddress] = await db
      .insert(addressesTable)
      .values({
        userId,
        label: label ?? "Home",
        address,
        area,
        city: city ?? "Cairo",
        latitude,
        longitude,
        landmark,
        floorApartment,
        isDefault: isDefault ?? false,
      })
      .returning();

    res.json(newAddress);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to add address" });
  }
});

router.patch("/addresses/:id", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const addressId = Number(req.params.id);

    if (req.body.isDefault) {
      await db
        .update(addressesTable)
        .set({ isDefault: false })
        .where(eq(addressesTable.userId, userId));
    }

    const [updated] = await db
      .update(addressesTable)
      .set(req.body)
      .where(eq(addressesTable.id, addressId))
      .returning();

    if (!updated) return res.status(404).json({ error: "Address not found" });

    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update address" });
  }
});

router.delete("/addresses/:id", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const addressId = Number(req.params.id);

    const [existing] = await db
      .select()
      .from(addressesTable)
      .where(eq(addressesTable.id, addressId))
      .limit(1);

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Address not found" });
    }

    await db.delete(addressesTable).where(eq(addressesTable.id, addressId));

    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete address" });
  }
});

router.get("/notifications", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const notifs = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);

    res.json(notifs);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [updated] = await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, Number(req.params.id)))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

export default router;
