import { Router } from "express";
import { db, itemsTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";
import {
  CreateItemBody,
  UpdateItemBody,
  ListItemsQueryParams,
  GetItemParams,
  UpdateItemParams,
  DeleteItemParams,
  TrashItemParams,
  RestoreItemParams,
  PinItemParams,
  PinItemBody,
} from "@workspace/api-zod";

const router = Router();

function scorePassword(password: string): string {
  if (!password) return "vulnerable";
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const varietyCount = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
  if (len < 8 || varietyCount < 2) return "vulnerable";
  if (len < 12 || varietyCount < 3) return "weak";
  if (len < 16 || varietyCount < 4) return "strong";
  return "very_strong";
}

function parseUrls(urls: string | null | undefined): string[] {
  if (!urls) return [];
  try { return JSON.parse(urls); } catch { return []; }
}

function formatItem(item: typeof itemsTable.$inferSelect) {
  return {
    ...item,
    urls: parseUrls(item.urls),
  };
}

router.get("/items", async (req, res) => {
  const params = ListItemsQueryParams.parse(req.query);
  let query = db.select().from(itemsTable).$dynamic();

  const conditions = [];
  if (params.vaultId !== undefined) conditions.push(eq(itemsTable.vaultId, params.vaultId));
  if (params.type !== undefined) conditions.push(eq(itemsTable.type, params.type));
  if (params.trashed !== undefined) conditions.push(eq(itemsTable.trashed, params.trashed));
  else conditions.push(eq(itemsTable.trashed, false));
  if (params.pinned !== undefined) conditions.push(eq(itemsTable.pinned, params.pinned));
  if (params.search) conditions.push(ilike(itemsTable.title, `%${params.search}%`));

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const items = await query.orderBy(itemsTable.pinned, itemsTable.updatedAt);
  res.json(items.map(formatItem));
});

router.post("/items", async (req, res) => {
  const body = CreateItemBody.parse(req.body);
  const urlsJson = body.urls ? JSON.stringify(body.urls) : null;
  const passwordScore = body.password ? scorePassword(body.password) : undefined;
  const [item] = await db
    .insert(itemsTable)
    .values({ ...body, urls: urlsJson, passwordScore })
    .returning();
  res.status(201).json(formatItem(item));
});

router.get("/items/:itemId", async (req, res) => {
  const { itemId } = GetItemParams.parse(req.params);
  const [item] = await db.select().from(itemsTable).where(eq(itemsTable.id, itemId));
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(formatItem(item));
});

router.patch("/items/:itemId", async (req, res) => {
  const { itemId } = UpdateItemParams.parse(req.params);
  const body = UpdateItemBody.parse(req.body);
  const updates: Record<string, unknown> = { ...body, updatedAt: new Date() };
  if (body.urls !== undefined) updates.urls = JSON.stringify(body.urls);
  if (body.password !== undefined) updates.passwordScore = scorePassword(body.password);
  const [item] = await db
    .update(itemsTable)
    .set(updates)
    .where(eq(itemsTable.id, itemId))
    .returning();
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(formatItem(item));
});

router.delete("/items/:itemId", async (req, res) => {
  const { itemId } = DeleteItemParams.parse(req.params);
  await db.delete(itemsTable).where(eq(itemsTable.id, itemId));
  res.status(204).send();
});

router.post("/items/:itemId/trash", async (req, res) => {
  const { itemId } = TrashItemParams.parse(req.params);
  const [item] = await db
    .update(itemsTable)
    .set({ trashed: true, updatedAt: new Date() })
    .where(eq(itemsTable.id, itemId))
    .returning();
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(formatItem(item));
});

router.post("/items/:itemId/restore", async (req, res) => {
  const { itemId } = RestoreItemParams.parse(req.params);
  const [item] = await db
    .update(itemsTable)
    .set({ trashed: false, updatedAt: new Date() })
    .where(eq(itemsTable.id, itemId))
    .returning();
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(formatItem(item));
});

router.post("/items/:itemId/pin", async (req, res) => {
  const { itemId } = PinItemParams.parse(req.params);
  const body = PinItemBody.parse(req.body);
  const [item] = await db
    .update(itemsTable)
    .set({ pinned: body.pinned, updatedAt: new Date() })
    .where(eq(itemsTable.id, itemId))
    .returning();
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(formatItem(item));
});

export default router;
