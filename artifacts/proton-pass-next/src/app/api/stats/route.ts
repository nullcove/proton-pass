import { NextResponse } from "next/server";
import { getDb, itemsTable, vaultsTable } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

function parseUrls(u: string | null | undefined) {
  if (!u) return [];
  try { return JSON.parse(u); } catch { return []; }
}

export async function GET() {
  try {
    const db = getDb();
    const allItems = await db.select().from(itemsTable).where(eq(itemsTable.trashed, false));
    const totalItems = allItems.length;
    const loginCount = allItems.filter((i) => i.type === "login").length;
    const cardCount = allItems.filter((i) => i.type === "card").length;
    const noteCount = allItems.filter((i) => i.type === "note").length;
    const identityCount = allItems.filter((i) => i.type === "identity").length;
    const aliasCount = allItems.filter((i) => i.type === "alias").length;
    const weakPasswordCount = allItems.filter(
      (i) => i.type === "login" && (i.passwordScore === "vulnerable" || i.passwordScore === "weak")
    ).length;
    const strongPasswordCount = allItems.filter(
      (i) => i.type === "login" && (i.passwordScore === "strong" || i.passwordScore === "very_strong")
    ).length;
    const loginItems = allItems.filter((i) => i.type === "login" && i.password);
    const passwordMap = new Map<string, typeof allItems>();
    for (const item of loginItems) {
      if (!item.password) continue;
      const existing = passwordMap.get(item.password) ?? [];
      existing.push(item);
      passwordMap.set(item.password, existing);
    }
    const reusedPasswordCount = Array.from(passwordMap.values())
      .filter((g) => g.length > 1)
      .reduce((acc, g) => acc + g.length, 0);
    const [vaultRow] = await db.select({ count: sql<number>`count(*)::int` }).from(vaultsTable);
    const totalVaults = vaultRow?.count ?? 0;
    const [trashedRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(itemsTable)
      .where(eq(itemsTable.trashed, true));
    const trashedCount = trashedRow?.count ?? 0;
    const recentActivity = allItems
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map((i) => ({ ...i, urls: parseUrls(i.urls) }));
    return NextResponse.json({
      totalItems, totalVaults, loginCount, cardCount, noteCount,
      identityCount, aliasCount, weakPasswordCount, reusedPasswordCount,
      strongPasswordCount, trashedCount, recentActivity,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
