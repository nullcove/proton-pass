import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, formatItem } from "@/lib/insforge";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const client = getAdminClient();
    const { id } = await params;
    const { pinned } = await req.json();
    const { data, error } = await client.database
      .from("items")
      .update({ pinned, updated_at: new Date().toISOString() })
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
