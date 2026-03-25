import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  integer,
  numeric,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const spiceLevelEnum = pgEnum("spice_level", [
  "none",
  "mild",
  "medium",
  "hot",
  "extra_hot",
]);

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  nameFr: text("name_fr"),
  nameDe: text("name_de"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  descriptionFr: text("description_fr"),
  descriptionDe: text("description_de"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  discountedPrice: numeric("discounted_price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  images: jsonb("images").$type<string[]>().default([]),
  ingredients: text("ingredients"),
  allergens: text("allergens"),
  calories: integer("calories"),
  prepTime: integer("prep_time").default(20),
  spiceLevel: spiceLevelEnum("spice_level").default("none"),
  isAvailable: boolean("is_available").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isBestSeller: boolean("is_best_seller").default(false).notNull(),
  isNew: boolean("is_new").default(false).notNull(),
  isVegetarian: boolean("is_vegetarian").default(false).notNull(),
  isHealthy: boolean("is_healthy").default(false).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  sortOrder: integer("sort_order").default(0),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const addOnsTable = pgTable("add_ons", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  nameFr: text("name_fr"),
  nameDe: text("name_de"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  maxQuantity: integer("max_quantity").default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productVariantsTable = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  nameFr: text("name_fr"),
  nameDe: text("name_de"),
  priceDiff: numeric("price_diff", { precision: 10, scale: 2 }).default("0"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

export const insertAddOnSchema = createInsertSchema(addOnsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAddOn = z.infer<typeof insertAddOnSchema>;
export type AddOn = typeof addOnsTable.$inferSelect;
