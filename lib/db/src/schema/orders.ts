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

export const orderStatusEnum = pgEnum("order_status", [
  "placed",
  "payment_pending",
  "payment_confirmed",
  "accepted",
  "preparing",
  "packed",
  "waiting_rider",
  "rider_assigned",
  "rider_heading_restaurant",
  "rider_arrived_restaurant",
  "picked_up",
  "on_the_way",
  "near_customer",
  "arrived",
  "delivered",
  "completed",
  "cancelled",
  "failed_delivery",
  "refund_pending",
  "refunded",
]);

export const orderTypeEnum = pgEnum("order_type", ["delivery", "pickup"]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: integer("user_id").notNull(),
  branchId: integer("branch_id").notNull(),
  riderId: integer("rider_id"),
  status: orderStatusEnum("status").default("placed").notNull(),
  type: orderTypeEnum("type").default("delivery").notNull(),
  addressId: integer("address_id"),
  deliveryAddress: text("delivery_address"),
  deliveryLatitude: text("delivery_latitude"),
  deliveryLongitude: text("delivery_longitude"),
  deliveryNotes: text("delivery_notes"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).default(
    "0"
  ),
  serviceFee: numeric("service_fee", { precision: 10, scale: 2 }).default("0"),
  tax: numeric("tax", { precision: 10, scale: 2 }).default("0"),
  tip: numeric("tip", { precision: 10, scale: 2 }).default("0"),
  discount: numeric("discount", { precision: 10, scale: 2 }).default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  couponId: integer("coupon_id"),
  couponCode: text("coupon_code"),
  loyaltyPointsUsed: integer("loyalty_points_used").default(0),
  loyaltyPointsEarned: integer("loyalty_points_earned").default(0),
  specialInstructions: text("special_instructions"),
  estimatedPickupTime: timestamp("estimated_pickup_time"),
  estimatedDeliveryTime: timestamp("estimated_delivery_time"),
  actualDeliveryTime: timestamp("actual_delivery_time"),
  scheduledFor: timestamp("scheduled_for"),
  isContactless: boolean("is_contactless").default(false),
  otpCode: text("otp_code"),
  proofOfDelivery: text("proof_of_delivery"),
  cancellationReason: text("cancellation_reason"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  variantName: text("variant_name"),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  addOns: jsonb("add_ons")
    .$type<{ name: string; price: number }[]>()
    .default([]),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderStatusHistoryTable = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  status: orderStatusEnum("status").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderMessagesTable = pgTable("order_messages", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  senderType: text("sender_type").notNull(),
  senderId: integer("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

export const insertOrderItemSchema = createInsertSchema(orderItemsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItemsTable.$inferSelect;
