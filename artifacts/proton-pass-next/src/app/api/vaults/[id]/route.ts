import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/insforge";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const client = getAdminClient();
    const { id } = await params;
    const { data: vaults, error } = await client.database
      .from("vaults")
      .select("*")
      .eq("id", Number(id));
    if (error) throw error;
    const vault = (vaults ?? [])[0];
    if (!vault) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: items } = await client.database
      .from("items")
      .select("id")
      .eq("vault_id", Number(id));
    return NextResponse.json({ ...vault, itemCount: (items ?? []).length });
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
    const { data, error } = await client.database
      .from("vaults")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", Number(id))
      .select();
    if (error) throw error;
    const vault = (data ?? [])[0];
    if (!vault) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: items } = await client.database
      .from("items")
      .select("id")
      .eq("vault_id", Number(id));
    return NextResponse.json({ ...vault, itemCount: (items ?? []).length });
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
      .from("vaults")
      .delete()
      .eq("id", Number(id));
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
