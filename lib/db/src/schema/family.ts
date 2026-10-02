import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const familyTable = pgTable("family_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  relationship: text("relationship").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFamilySchema = createInsertSchema(familyTable).omit({ id: true, createdAt: true });
export type InsertFamily = z.infer<typeof insertFamilySchema>;
export type FamilyContact = typeof familyTable.$inferSelect;
