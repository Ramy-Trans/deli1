import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

const router = Router();

const otpStore = new Map<string, { otp: string; expires: number }>();

function generateToken(userId: number): string {
  return Buffer.from(
    JSON.stringify({ userId, ts: Date.now(), r: crypto.randomBytes(8).toString("hex") })
  ).toString("base64url");
}

function sanitizeUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash, fcmToken, ...safe } = user;
  return safe;
}

router.post("/send-otp", async (req, res) => {
  try {
    const schema = z.object({ phone: z.string().min(8) });
    const { phone } = schema.parse(req.body);

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 });

    res.json({ success: true, otp });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Invalid phone number" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const schema = z.object({
      phone: z.string().min(8),
      otp: z.string().length(6),
      name: z.string().min(2).optional(),
    });
    const body = schema.parse(req.body);

    const stored = otpStore.get(body.phone);
    if (!stored || stored.otp !== body.otp || Date.now() > stored.expires) {
      return res.status(401).json({ error: "Invalid or expired code. Please try again." });
    }
    otpStore.delete(body.phone);

    let existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone, body.phone))
      .limit(1);

    let user = existing[0];
    if (!user) {
      const referralCode = `SG${body.phone.slice(-6)}`;
      [user] = await db
        .insert(usersTable)
        .values({
          name: body.name ?? "Guest",
          phone: body.phone,
          referralCode,
          loyaltyPoints: 100,
        })
        .returning();
    } else if (body.name && user.name === "Guest") {
      [user] = await db
        .update(usersTable)
        .set({ name: body.name })
        .where(eq(usersTable.id, user.id))
        .returning();
    }

    const token = generateToken(user.id);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Verification failed" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      phone: z.string().min(10),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
    });
    const body = schema.parse(req.body);

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone, body.phone))
      .limit(1);

    if (existing.length > 0) {
      const user = existing[0];
      const token = generateToken(user.id);
      return res.json({ token, user: sanitizeUser(user) });
    }

    const referralCode = `SG${body.phone.slice(-6)}`;
    const [user] = await db
      .insert(usersTable)
      .values({
        name: body.name,
        phone: body.phone,
        email: body.email,
        referralCode,
        loyaltyPoints: 100,
      })
      .returning();

    const token = generateToken(user.id);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const schema = z.object({ phone: z.string() });
    const body = schema.parse(req.body);

    let users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone, body.phone))
      .limit(1);

    if (users.length === 0) {
      const [newUser] = await db
        .insert(usersTable)
        .values({
          name: "Guest",
          phone: body.phone,
          referralCode: `SG${body.phone.slice(-6)}`,
          loyaltyPoints: 100,
        })
        .returning();
      users = [newUser];
    }

    const user = users[0];
    const token = generateToken(user.id);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Login failed" });
  }
});

export default router;
