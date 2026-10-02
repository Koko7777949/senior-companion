import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { familyTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreateFamilyContactBody, DeleteFamilyContactParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const contacts = await db.select().from(familyTable).orderBy(familyTable.createdAt);
    res.json(contacts);
  } catch (err) {
    req.log.error({ err }, "Failed to get family contacts");
    res.status(500).json({ error: "Failed to get family contacts" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateFamilyContactBody.parse(req.body);
    const [contact] = await db.insert(familyTable).values({
      name: body.name,
      phone: body.phone,
      relationship: body.relationship,
      isPrimary: body.isPrimary ?? false,
    }).returning();
    res.status(201).json(contact);
  } catch (err) {
    req.log.error({ err }, "Failed to create family contact");
    res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = DeleteFamilyContactParams.parse(req.params);
    await db.delete(familyTable).where(eq(familyTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete family contact");
    res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
