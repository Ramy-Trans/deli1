import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const loyaltyTxTypeEnum = pgEnum("loyalty_tx_type", [
  "earned",
  "redeemed",
  "expired",
  "bonus",
  "referral",
]);

export const loyaltyTransactionsTable = pgTable("loyalty_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderId: integer("order_id"),
  type: loyaltyTxTypeEnum("type").notNull(),
  points: integer("points").notNull(),
  balance: integer("balance").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLoyaltyTxSchema = createInsertSchema(
  loyaltyTransactionsTable
).omit({ id: true, createdAt: true });
export type InsertLoyaltyTx = z.infer<typeof insertLoyaltyTxSchema>;
export type LoyaltyTx = typeof loyaltyTransactionsTable.$inferSelect;
