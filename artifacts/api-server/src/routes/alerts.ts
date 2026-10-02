import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { alertsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreateAlertBody, ResolveAlertParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const alerts = await db.select().from(alertsTable).orderBy(alertsTable.createdAt);
    res.json(alerts.reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to get alerts");
    res.status(500).json({ error: "Failed to get alerts" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateAlertBody.parse(req.body);
    const [alert] = await db.insert(alertsTable).values({
      type: body.type,
      message: body.message,
      severity: body.severity,
      isResolved: false,
    }).returning();
    res.status(201).json(alert);
  } catch (err) {
    req.log.error({ err }, "Failed to create alert");
    res.status(400).json({ error: "Invalid input" });
  }
});

router.patch("/:id/resolve", async (req, res) => {
  try {
    const { id } = ResolveAlertParams.parse(req.params);
    const [alert] = await db.update(alertsTable)
      .set({ isResolved: true })
      .where(eq(alertsTable.id, id))
      .returning();
    if (!alert) {
      res.status(404).json({ error: "Alert not found" });
      return;
    }
    res.json(alert);
  } catch (err) {
    req.log.error({ err }, "Failed to resolve alert");
    res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
