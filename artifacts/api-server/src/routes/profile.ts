import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { patientProfileTable, medicationLogsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { UpdateProfileBody, MarkReminderTakenParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function getOrCreateProfile() {
  const [existing] = await db.select().from(patientProfileTable).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(patientProfileTable).values({
    fullName: "المريض",
    age: 70,
    bloodType: "A+",
    conditions: [],
  }).returning();
  return created;
}

router.get("/profile", async (req, res) => {
  try {
    const profile = await getOrCreateProfile();
    res.json(profile);
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Failed to get profile" });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const body = UpdateProfileBody.parse(req.body);
    const existing = await getOrCreateProfile();
    const [updated] = await db.update(patientProfileTable)
      .set({
        fullName: body.fullName,
        age: body.age,
        bloodType: body.bloodType,
        roomNumber: body.roomNumber ?? null,
        doctorName: body.doctorName ?? null,
        conditions: body.conditions,
        notes: body.notes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(patientProfileTable.id, existing.id))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    res.status(400).json({ error: "Invalid input" });
  }
});

router.post("/reminders/:id/taken", async (req, res) => {
  try {
    const { id } = MarkReminderTakenParams.parse(req.params);
    const today = new Date().toISOString().split("T")[0];
    const existing = await db.select().from(medicationLogsTable)
      .where(and(eq(medicationLogsTable.reminderId, id), eq(medicationLogsTable.date, today)))
      .limit(1);
    if (existing.length > 0) {
      res.status(201).json(existing[0]);
      return;
    }
    const [log] = await db.insert(medicationLogsTable).values({
      reminderId: id,
      date: today,
      status: "taken",
    }).returning();
    res.status(201).json(log);
  } catch (err) {
    req.log.error({ err }, "Failed to mark reminder taken");
    res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/medication-logs/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const logs = await db.select().from(medicationLogsTable)
      .where(eq(medicationLogsTable.date, today));
    res.json(logs);
  } catch (err) {
    req.log.error({ err }, "Failed to get today logs");
    res.status(500).json({ error: "Failed to get logs" });
  }
});

export default router;
