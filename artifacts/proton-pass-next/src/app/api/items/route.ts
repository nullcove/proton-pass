import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, formatItem, scorePassword } from "@/lib/insforge";

export async function GET(req: NextRequest) {
  try {
    const client = getAdminClient();
    const { searchParams } = req.nextUrl;
    const vaultId = searchParams.get("vaultId");
    const type = searchParams.get("type");
    const trashed = searchParams.get("trashed");
    const search = searchParams.get("search");
    const pinned = searchParams.get("pinned");

    let query = client.database.from("items").select("*");
    if (vaultId) query = query.eq("vault_id", Number(vaultId));
    if (type) query = query.eq("type", type);
    if (trashed !== null) query = query.eq("trashed", trashed === "true");
    if (search) query = query.ilike("title", `%${search}%`);
    if (pinned !== null) query = query.eq("pinned", pinned === "true");

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json((data ?? []).map(formatItem));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = getAdminClient();
    const body = await req.json();
    const passwordScore =
      body.type === "login" && body.password ? scorePassword(body.password) : null;
    const urlsJson = Array.isArray(body.urls) ? JSON.stringify(body.urls) : null;
    const { data, error } = await client.database
      .from("items")
      .insert([{
        vault_id: body.vaultId ?? body.vault_id,
        type: body.type ?? "login",
        title: body.title,
        username: body.username ?? null,
        password: body.password ?? null,
        urls: urlsJson,
        note: body.note ?? null,
        pinned: body.pinned ?? false,
        trashed: false,
        password_score: passwordScore,
      }])
      .select();
    if (error) throw error;
    const item = (data ?? [])[0];
    return NextResponse.json(formatItem(item), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
