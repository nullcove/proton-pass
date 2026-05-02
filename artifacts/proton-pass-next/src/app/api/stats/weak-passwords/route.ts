import { NextResponse } from "next/server";
import { getDb, itemsTable } from "@/lib/db";
import { and, eq, sql } from "drizzle-orm";

function parseUrls(u: string | null | undefined) {
  if (!u) return [];
  try { return JSON.parse(u); } catch { return []; }
}

export async function GET() {
  try {
    const db = getDb();
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
    return NextResponse.json(items.map((i) => ({ ...i, urls: parseUrls(i.urls) })));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
