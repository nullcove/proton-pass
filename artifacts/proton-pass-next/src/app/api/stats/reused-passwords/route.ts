import { NextResponse } from "next/server";
import { getAdminClient, formatItem } from "@/lib/insforge";

export async function GET() {
  try {
    const client = getAdminClient();
    const { data, error } = await client.database
      .from("items")
      .select("*")
      .eq("trashed", false)
      .eq("type", "login");
    if (error) throw error;

    const loginItems = data ?? [];
    const passwordMap = new Map<string, Record<string, unknown>[]>();
    for (const item of loginItems) {
      const pw = (item as Record<string, unknown>).password as string;
      if (!pw) continue;
      const existing = passwordMap.get(pw) ?? [];
      existing.push(item as Record<string, unknown>);
      passwordMap.set(pw, existing);
    }
    const reusedGroups = Array.from(passwordMap.values())
      .filter((g) => g.length > 1)
      .map((g) => g.map(formatItem));
    return NextResponse.json(reusedGroups);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
