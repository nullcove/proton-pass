import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const itemsTable = pgTable("items", {
  id: serial("id").primaryKey(),
  vaultId: integer("vault_id").notNull(),
  type: text("type").notNull(), // login | card | note | identity | alias
  title: text("title").notNull(),
  username: text("username"),
  password: text("password"),
  urls: text("urls"), // JSON array stored as text
  note: text("note"),
  cardholderName: text("cardholder_name"),
  cardNumber: text("card_number"),
  expirationDate: text("expiration_date"),
  cvv: text("cvv"),
  cardType: text("card_type"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  aliasEmail: text("alias_email"),
  totp: text("totp"),
  pinned: boolean("pinned").notNull().default(false),
  trashed: boolean("trashed").notNull().default(false),
  passwordScore: text("password_score"), // vulnerable | weak | strong | very_strong
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertItemSchema = createInsertSchema(itemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof itemsTable.$inferSelect;
