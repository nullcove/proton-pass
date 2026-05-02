import { NextRequest, NextResponse } from "next/server";
import { getDb, vaultsTable, itemsTable } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();
    const vaults = await db.select().from(vaultsTable).orderBy(vaultsTable.createdAt);
    const counts = await db
      .select({ vaultId: itemsTable.vaultId, count: sql<number>`count(*)::int` })
      .from(itemsTable)
      .where(eq(itemsTable.trashed, false))
      .groupBy(itemsTable.vaultId);
    const countMap = Object.fromEntries(counts.map((c) => [c.vaultId, c.count]));
    const result = vaults.map((v) => ({ ...v, itemCount: countMap[v.id] ?? 0 }));
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const [vault] = await db.insert(vaultsTable).values({
      name: body.name,
      description: body.description,
      color: body.color ?? "#6D4AFF",
      icon: body.icon ?? "shield",
    }).returning();
    return NextResponse.json({ ...vault, itemCount: 0 }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
