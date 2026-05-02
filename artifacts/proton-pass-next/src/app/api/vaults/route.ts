import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/insforge";

export async function GET() {
  try {
    const client = getAdminClient();
    const { data: vaults, error } = await client.database
      .from("vaults")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;

    const { data: items } = await client.database
      .from("items")
      .select("vault_id")
      .eq("trashed", false);

    const countMap: Record<number, number> = {};
    for (const row of items ?? []) {
      const vid = (row as { vault_id: number }).vault_id;
      countMap[vid] = (countMap[vid] ?? 0) + 1;
    }

    const result = (vaults ?? []).map((v: Record<string, unknown>) => ({
      ...v,
      itemCount: countMap[v.id as number] ?? 0,
    }));
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const client = getAdminClient();
    const body = await req.json();
    const { data, error } = await client.database
      .from("vaults")
      .insert([{
        name: body.name,
        description: body.description ?? null,
        color: body.color ?? "#6D4AFF",
        icon: body.icon ?? "shield",
      }])
      .select();
    if (error) throw error;
    const vault = (data ?? [])[0];
    return NextResponse.json({ ...vault, itemCount: 0 }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
