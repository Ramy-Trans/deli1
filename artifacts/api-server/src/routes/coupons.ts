import { Router } from "express";
import { db } from "@workspace/db";
import { couponsTable } from "@workspace/db/schema";
import { eq, and, gt, isNull, or, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const coupons = await db
      .select()
      .from(couponsTable)
      .where(
        and(
          eq(couponsTable.isActive, true),
          or(isNull(couponsTable.expiresAt), gt(couponsTable.expiresAt, new Date()))
        )
      )
      .orderBy(desc(couponsTable.createdAt));

    res.json(
      coupons.map((c) => ({
        id: c.id,
        code: c.code,
        description: c.description,
        discountType: c.discountType,
        discountValue: Number(c.discountValue),
        minOrderAmount: Number(c.minOrderAmount ?? 0),
        maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
        expiresAt: c.expiresAt,
      }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

router.get("/:code", async (req, res) => {
  try {
    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(
        and(
          eq(couponsTable.code, req.params.code.toUpperCase()),
          eq(couponsTable.isActive, true),
          or(isNull(couponsTable.expiresAt), gt(couponsTable.expiresAt, new Date()))
        )
      )
      .limit(1);

    if (!coupon) {
      return res.status(404).json({ valid: false, message: "Invalid or expired coupon" });
    }

    const typeLabel =
      coupon.discountType === "percentage"
        ? `${coupon.discountValue}% off`
        : coupon.discountType === "fixed"
        ? `EGP ${coupon.discountValue} off`
        : "Free delivery";

    res.json({
      id: coupon.id,
      code: coupon.code,
      valid: true,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      minOrderAmount: Number(coupon.minOrderAmount ?? 0),
      description: typeLabel,
      expiresAt: coupon.expiresAt,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch coupon" });
  }
});

router.post("/validate", async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(
        and(
          eq(couponsTable.code, code.toUpperCase()),
          eq(couponsTable.isActive, true),
          or(isNull(couponsTable.expiresAt), gt(couponsTable.expiresAt, new Date()))
        )
      )
      .limit(1);

    if (!coupon) {
      return res.json({ valid: false, message: "Invalid or expired coupon" });
    }

    if (coupon.minOrderAmount && Number(orderAmount) < Number(coupon.minOrderAmount)) {
      return res.json({
        valid: false,
        message: `Minimum order amount is EGP ${coupon.minOrderAmount}`,
      });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (Number(orderAmount) * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else if (coupon.discountType === "fixed") {
      discount = Number(coupon.discountValue);
    } else if (coupon.discountType === "free_delivery") {
      discount = 20;
    }

    res.json({
      valid: true,
      discount,
      couponId: coupon.id,
      message: `Coupon applied! You save EGP ${discount.toFixed(2)}`,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Coupon validation failed" });
  }
});

export default router;
