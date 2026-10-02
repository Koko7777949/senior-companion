import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { remindersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreateReminderBody, UpdateReminderBody, UpdateReminderParams, DeleteReminderParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const reminders = await db.select().from(remindersTable).orderBy(remindersTable.createdAt);
    res.json(reminders);
  } catch (err) {
    req.log.error({ err }, "Failed to get reminders");
    res.status(500).json({ error: "Failed to get reminders" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateReminderBody.parse(req.body);
    const [reminder] = await db.insert(remindersTable).values({
      medicationName: body.medicationName,
      dosage: body.dosage,
      time: body.time,
      days: body.days,
      isActive: body.isActive ?? true,
      notes: body.notes,
    }).returning();
    res.status(201).json(reminder);
  } catch (err) {
    req.log.error({ err }, "Failed to create reminder");
    res.status(400).json({ error: "Invalid input" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = UpdateReminderParams.parse(req.params);
    const body = UpdateReminderBody.parse(req.body);
    const [reminder] = await db.update(remindersTable).set({
      medicationName: body.medicationName,
      dosage: body.dosage,
      time: body.time,
      days: body.days,
      isActive: body.isActive ?? true,
      notes: body.notes,
    }).where(eq(remindersTable.id, id)).returning();
    if (!reminder) {
      res.status(404).json({ error: "Reminder not found" });
      return;
    }
    res.json(reminder);
  } catch (err) {
    req.log.error({ err }, "Failed to update reminder");
    res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = DeleteReminderParams.parse(req.params);
    await db.delete(remindersTable).where(eq(remindersTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete reminder");
    res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
