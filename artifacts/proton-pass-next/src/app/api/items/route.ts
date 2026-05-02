import { NextRequest, NextResponse } from "next/server";
import { getDb, itemsTable } from "@/lib/db";
import { eq, and, ilike, sql } from "drizzle-orm";

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

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = req.nextUrl;
    const vaultId = searchParams.get("vaultId");
    const type = searchParams.get("type");
    const trashed = searchParams.get("trashed");
    const search = searchParams.get("search");
    const pinned = searchParams.get("pinned");

    const conditions = [];
    if (vaultId) conditions.push(eq(itemsTable.vaultId, Number(vaultId)));
    if (type) conditions.push(eq(itemsTable.type, type));
    if (trashed !== null) conditions.push(eq(itemsTable.trashed, trashed === "true"));
    if (search) conditions.push(ilike(itemsTable.title, `%${search}%`));
    if (pinned !== null) conditions.push(eq(itemsTable.pinned, pinned === "true"));

    const rows =
      conditions.length > 0
        ? await db.select().from(itemsTable).where(and(...conditions))
        : await db.select().from(itemsTable);

    return NextResponse.json(rows.map(formatItem));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const passwordScore =
      body.type === "login" && body.password ? scorePassword(body.password) : undefined;
    const urlsJson = Array.isArray(body.urls) ? JSON.stringify(body.urls) : null;
    const [item] = await db
      .insert(itemsTable)
      .values({ ...body, urls: urlsJson, passwordScore })
      .returning();
    return NextResponse.json(formatItem(item), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
