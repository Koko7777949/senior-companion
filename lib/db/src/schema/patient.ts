import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const patientProfileTable = pgTable("patient_profile", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull().default("المريض"),
  age: integer("age").notNull().default(70),
  bloodType: text("blood_type").notNull().default("A+"),
  roomNumber: text("room_number"),
  doctorName: text("doctor_name"),
  conditions: text("conditions").array().notNull().default([]),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const medicationLogsTable = pgTable("medication_logs", {
  id: serial("id").primaryKey(),
  reminderId: integer("reminder_id").notNull(),
  date: text("date").notNull(),
  status: text("status").notNull().default("taken"),
  takenAt: timestamp("taken_at").notNull().defaultNow(),
});

export const insertPatientProfileSchema = createInsertSchema(patientProfileTable).omit({ id: true, updatedAt: true });
export const insertMedicationLogSchema = createInsertSchema(medicationLogsTable).omit({ id: true, takenAt: true });

export type InsertPatientProfile = z.infer<typeof insertPatientProfileSchema>;
export type PatientProfile = typeof patientProfileTable.$inferSelect;
export type MedicationLog = typeof medicationLogsTable.$inferSelect;
