import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { branchesTable } from "./branches";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "staff",
  "rider",
  "manager",
  "admin",
]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").default("customer").notNull(),
  avatarUrl: text("avatar_url"),
  preferredLanguage: text("preferred_language").default("en"),
  darkMode: boolean("dark_mode").default(false),
  isActive: boolean("is_active").default(true).notNull(),
  loyaltyPoints: integer("loyalty_points").default(0).notNull(),
  referralCode: text("referral_code"),
  referredBy: integer("referred_by"),
  fcmToken: text("fcm_token"),
  branchId: integer("branch_id").references(() => branchesTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const addressesTable = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  label: text("label").notNull(),
  address: text("address").notNull(),
  area: text("area"),
  city: text("city").default("Cairo"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  landmark: text("landmark"),
  floorApartment: text("floor_apartment"),
  gateCode: text("gate_code"),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAddressSchema = createInsertSchema(addressesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Address = typeof addressesTable.$inferSelect;
