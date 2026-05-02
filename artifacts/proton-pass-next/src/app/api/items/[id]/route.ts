import { NextRequest, NextResponse } from "next/server";
import { getDb, itemsTable } from "@/lib/db";
import { eq } from "drizzle-orm";

function parseUrls(urls: string | null | undefined): string[] {
  if (!urls) return [];
  try { return JSON.parse(urls); } catch { return []; }
}

function formatItem(item: typeof itemsTable.$inferSelect) {
  return { ...item, urls: parseUrls(item.urls) };
}

function scorePassword(password: string): string {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const variety = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
  if (len < 8 || variety < 2) return "vulnerable";
  if (len < 12 || variety < 3) return "weak";
  if (len < 16 || variety < 4) return "strong";
  return "very_strong";
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    const [item] = await db.select().from(itemsTable).where(eq(itemsTable.id, Number(id)));
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(formatItem(item));
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
    const passwordScore =
      body.password ? scorePassword(body.password) : undefined;
    const urlsJson = Array.isArray(body.urls) ? JSON.stringify(body.urls) : undefined;
    const updateData: Record<string, unknown> = { ...body, updatedAt: new Date() };
    if (urlsJson !== undefined) updateData.urls = urlsJson;
    if (passwordScore !== undefined) updateData.passwordScore = passwordScore;
    const [item] = await db
      .update(itemsTable)
      .set(updateData)
      .where(eq(itemsTable.id, Number(id)))
      .returning();
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(formatItem(item));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    await db.delete(itemsTable).where(eq(itemsTable.id, Number(id)));
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
