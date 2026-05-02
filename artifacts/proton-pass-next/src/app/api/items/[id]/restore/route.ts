import { NextRequest, NextResponse } from "next/server";
import { getDb, itemsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

function parseUrls(u: string | null | undefined) {
  if (!u) return [];
  try { return JSON.parse(u); } catch { return []; }
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    const [item] = await db
      .update(itemsTable)
      .set({ trashed: false, updatedAt: new Date() })
      .where(eq(itemsTable.id, Number(id)))
      .returning();
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ...item, urls: parseUrls(item.urls) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
