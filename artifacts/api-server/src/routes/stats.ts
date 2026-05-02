import { Router } from "express";
import { db, itemsTable, vaultsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

function parseUrls(urls: string | null | undefined): string[] {
  if (!urls) return [];
  try { return JSON.parse(urls); } catch { return []; }
}

function formatItem(item: typeof itemsTable.$inferSelect) {
  return { ...item, urls: parseUrls(item.urls) };
}

router.get("/stats", async (req, res) => {
  const allItems = await db.select().from(itemsTable).where(eq(itemsTable.trashed, false));

  const totalItems = allItems.length;
  const loginCount = allItems.filter(i => i.type === "login").length;
  const cardCount = allItems.filter(i => i.type === "card").length;
  const noteCount = allItems.filter(i => i.type === "note").length;
  const identityCount = allItems.filter(i => i.type === "identity").length;
  const aliasCount = allItems.filter(i => i.type === "alias").length;

  const weakPasswordCount = allItems.filter(
    i => i.type === "login" && (i.passwordScore === "vulnerable" || i.passwordScore === "weak")
  ).length;
  const strongPasswordCount = allItems.filter(
    i => i.type === "login" && (i.passwordScore === "strong" || i.passwordScore === "very_strong")
  ).length;

  const loginItems = allItems.filter(i => i.type === "login" && i.password);
  const passwordMap = new Map<string, typeof allItems>();
  for (const item of loginItems) {
    if (!item.password) continue;
    const existing = passwordMap.get(item.password) ?? [];
    existing.push(item);
    passwordMap.set(item.password, existing);
  }
  const reusedPasswordCount = Array.from(passwordMap.values())
    .filter(g => g.length > 1)
    .reduce((acc, g) => acc + g.length, 0);

  const vaultRows = await db.select({ count: sql<number>`count(*)::int` }).from(vaultsTable);
  const totalVaults = vaultRows[0]?.count ?? 0;

  const trashedRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(itemsTable)
    .where(eq(itemsTable.trashed, true));
  const trashedCount = trashedRows[0]?.count ?? 0;

  const recentActivity = allItems
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10)
    .map(formatItem);

  res.json({
    totalItems,
    totalVaults,
    loginCount,
    cardCount,
    noteCount,
    identityCount,
    aliasCount,
    weakPasswordCount,
    reusedPasswordCount,
    strongPasswordCount,
    trashedCount,
    recentActivity,
  });
});

router.get("/stats/weak-passwords", async (req, res) => {
  const items = await db
    .select()
    .from(itemsTable)
    .where(
      and(
        eq(itemsTable.trashed, false),
        eq(itemsTable.type, "login"),
        sql`${itemsTable.passwordScore} IN ('vulnerable', 'weak')`
      )
    );
  res.json(items.map(formatItem));
});

router.get("/stats/reused-passwords", async (req, res) => {
  const loginItems = await db
    .select()
    .from(itemsTable)
    .where(and(eq(itemsTable.trashed, false), eq(itemsTable.type, "login")));

  const passwordMap = new Map<string, typeof loginItems>();
  for (const item of loginItems) {
    if (!item.password) continue;
    const existing = passwordMap.get(item.password) ?? [];
    existing.push(item);
    passwordMap.set(item.password, existing);
  }

  const reusedGroups = Array.from(passwordMap.values())
    .filter(g => g.length > 1)
    .map(g => g.map(formatItem));

  res.json(reusedGroups);
});

export default router;
