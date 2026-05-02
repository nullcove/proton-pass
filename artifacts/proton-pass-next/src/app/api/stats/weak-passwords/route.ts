import { NextResponse } from "next/server";
import { getAdminClient, formatItem } from "@/lib/insforge";

export async function GET() {
  try {
    const client = getAdminClient();
    const { data, error } = await client.database
      .from("items")
      .select("*")
      .eq("trashed", false)
      .eq("type", "login")
      .in("password_score", ["vulnerable", "weak"]);
    if (error) throw error;
    return NextResponse.json((data ?? []).map(formatItem));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
