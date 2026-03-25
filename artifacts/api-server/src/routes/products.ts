import { Router } from "express";
import { db } from "@workspace/db";
import {
  productsTable,
  addOnsTable,
  productVariantsTable,
  categoriesTable,
} from "@workspace/db/schema";
import { eq, and, ilike, or } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { categoryId, search, featured, bestSeller, vegetarian, healthy } =
      req.query;

    const conditions = [eq(productsTable.isAvailable, true)];

    if (categoryId) {
      conditions.push(eq(productsTable.categoryId, Number(categoryId)));
    }
    if (search) {
      conditions.push(
        or(
          ilike(productsTable.name, `%${search}%`),
          ilike(productsTable.nameAr as any, `%${search}%`)
        ) as any
      );
    }
    if (featured === "true") {
      conditions.push(eq(productsTable.isFeatured, true));
    }
    if (bestSeller === "true") {
      conditions.push(eq(productsTable.isBestSeller, true));
    }
    if (vegetarian === "true") {
      conditions.push(eq(productsTable.isVegetarian, true));
    }
    if (healthy === "true") {
      conditions.push(eq(productsTable.isHealthy, true));
    }

    const products = await db
      .select()
      .from(productsTable)
      .where(and(...conditions))
      .orderBy(productsTable.sortOrder);

    res.json(products);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .limit(1);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const addOns = await db
      .select()
      .from(addOnsTable)
      .where(
        and(eq(addOnsTable.productId, id), eq(addOnsTable.isAvailable, true))
      );

    const variants = await db
      .select()
      .from(productVariantsTable)
      .where(eq(productVariantsTable.productId, id));

    const related = await db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.categoryId, product.categoryId),
          eq(productsTable.isAvailable, true)
        )
      )
      .limit(5);

    res.json({ ...product, addOns, variants, relatedProducts: related });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

export default router;
