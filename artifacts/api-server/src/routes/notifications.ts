import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUserIdFromToken } from "../lib/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);

    res.json(notifications);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

export default router;
