import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  time,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const branchesTable = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  address: text("address").notNull(),
  area: text("area"),
  city: text("city").default("Cairo"),
  phone: text("phone"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  openTime: time("open_time"),
  closeTime: time("close_time"),
  isActive: boolean("is_active").default(true).notNull(),
  acceptsDelivery: boolean("accepts_delivery").default(true).notNull(),
  acceptsPickup: boolean("accepts_pickup").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBranchSchema = createInsertSchema(branchesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Branch = typeof branchesTable.$inferSelect;
