import { NextRequest, NextResponse } from "next/server";
import { getDb, vaultsTable, itemsTable } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    const [vault] = await db.select().from(vaultsTable).where(eq(vaultsTable.id, Number(id)));
    if (!vault) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const [cnt] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(itemsTable)
      .where(eq(itemsTable.vaultId, vault.id));
    return NextResponse.json({ ...vault, itemCount: cnt?.count ?? 0 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await req.json();
    const [vault] = await db
      .update(vaultsTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(vaultsTable.id, Number(id)))
      .returning();
    if (!vault) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const [cnt] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(itemsTable)
      .where(eq(itemsTable.vaultId, vault.id));
    return NextResponse.json({ ...vault, itemCount: cnt?.count ?? 0 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    await db.delete(vaultsTable).where(eq(vaultsTable.id, Number(id)));
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
