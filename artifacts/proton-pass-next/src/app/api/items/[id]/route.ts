import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, formatItem, scorePassword } from "@/lib/insforge";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const client = getAdminClient();
    const { id } = await params;
    const { data, error } = await client.database
      .from("items")
      .select("*")
      .eq("id", Number(id));
    if (error) throw error;
    const item = (data ?? [])[0];
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(formatItem(item));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const client = getAdminClient();
    const { id } = await params;
    const body = await req.json();
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.title !== undefined) updateData.title = body.title;
    if (body.username !== undefined) updateData.username = body.username;
    if (body.password !== undefined) {
      updateData.password = body.password;
      updateData.password_score = scorePassword(body.password);
    }
    if (body.urls !== undefined) updateData.urls = Array.isArray(body.urls) ? JSON.stringify(body.urls) : body.urls;
    if (body.note !== undefined) updateData.note = body.note;
    if (body.pinned !== undefined) updateData.pinned = body.pinned;
    if (body.vault_id !== undefined) updateData.vault_id = body.vault_id;

    const { data, error } = await client.database
      .from("items")
      .update(updateData)
      .eq("id", Number(id))
      .select();
    if (error) throw error;
    const item = (data ?? [])[0];
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(formatItem(item));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const client = getAdminClient();
    const { id } = await params;
    const { error } = await client.database
      .from("items")
      .delete()
      .eq("id", Number(id));
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
