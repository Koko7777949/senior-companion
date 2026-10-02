import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { devicesTable, deviceReadingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreateDeviceBody, DeleteDeviceParams, GetDeviceReadingsParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const devices = await db.select().from(devicesTable).orderBy(devicesTable.createdAt);
    res.json(devices);
  } catch (err) {
    req.log.error({ err }, "Failed to get devices");
    res.status(500).json({ error: "Failed to get devices" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateDeviceBody.parse(req.body);
    const [device] = await db.insert(devicesTable).values({
      name: body.name,
      type: body.type,
      isConnected: false,
    }).returning();
    res.status(201).json(device);
  } catch (err) {
    req.log.error({ err }, "Failed to create device");
    res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = DeleteDeviceParams.parse(req.params);
    await db.delete(devicesTable).where(eq(devicesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete device");
    res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/:id/readings", async (req, res) => {
  try {
    const { id } = GetDeviceReadingsParams.parse(req.params);
    const readings = await db.select().from(deviceReadingsTable)
      .where(eq(deviceReadingsTable.deviceId, id))
      .orderBy(deviceReadingsTable.recordedAt);
    res.json(readings);
  } catch (err) {
    req.log.error({ err }, "Failed to get device readings");
    res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
