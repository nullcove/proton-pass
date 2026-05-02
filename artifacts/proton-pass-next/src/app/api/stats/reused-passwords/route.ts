import { NextResponse } from "next/server";
import { getDb, itemsTable } from "@/lib/db";
import { and, eq } from "drizzle-orm";

function parseUrls(u: string | null | undefined) {
  if (!u) return [];
  try { return JSON.parse(u); } catch { return []; }
}

export async function GET() {
  try {
    const db = getDb();
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
      .filter((g) => g.length > 1)
      .map((g) => g.map((i) => ({ ...i, urls: parseUrls(i.urls) })));
    return NextResponse.json(reusedGroups);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
