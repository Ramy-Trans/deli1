import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const riderStatusEnum = pgEnum("rider_status", [
  "offline",
  "available",
  "busy",
]);

export const ridersTable = pgTable("riders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vehicleType: text("vehicle_type").default("motorcycle"),
  vehiclePlate: text("vehicle_plate"),
  branchId: integer("branch_id"),
  status: riderStatusEnum("status").default("offline").notNull(),
  currentLatitude: text("current_latitude"),
  currentLongitude: text("current_longitude"),
  rating: text("rating").default("5.0"),
  totalDeliveries: integer("total_deliveries").default(0),
  isVerified: boolean("is_verified").default(false),
  profileImageUrl: text("profile_image_url"),
  loginPassword: text("login_password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRiderSchema = createInsertSchema(ridersTable).omit({
  id: true,
  createdAt: true,
});
export type InsertRider = z.infer<typeof insertRiderSchema>;
export type Rider = typeof ridersTable.$inferSelect;
