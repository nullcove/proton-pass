import { NextResponse } from "next/server";
import { getAdminClient, formatItem } from "@/lib/insforge";

export async function GET() {
  try {
    const client = getAdminClient();

    const [{ data: allItems }, { data: trashedItems }, { data: vaults }] = await Promise.all([
      client.database.from("items").select("*").eq("trashed", false),
      client.database.from("items").select("id").eq("trashed", true),
      client.database.from("vaults").select("id"),
    ]);

    const items = allItems ?? [];
    const totalItems = items.length;
    const loginCount = items.filter((i: Record<string, unknown>) => i.type === "login").length;
    const cardCount = items.filter((i: Record<string, unknown>) => i.type === "card").length;
    const noteCount = items.filter((i: Record<string, unknown>) => i.type === "note").length;
    const identityCount = items.filter((i: Record<string, unknown>) => i.type === "identity").length;
    const aliasCount = items.filter((i: Record<string, unknown>) => i.type === "alias").length;
    const weakPasswordCount = items.filter(
      (i: Record<string, unknown>) =>
        i.type === "login" &&
        (i.password_score === "vulnerable" || i.password_score === "weak")
    ).length;
    const strongPasswordCount = items.filter(
      (i: Record<string, unknown>) =>
        i.type === "login" &&
        (i.password_score === "strong" || i.password_score === "very_strong")
    ).length;

    const loginItems = items.filter(
      (i: Record<string, unknown>) => i.type === "login" && i.password
    );
    const passwordMap = new Map<string, Record<string, unknown>[]>();
    for (const item of loginItems) {
      const pw = item.password as string;
      const existing = passwordMap.get(pw) ?? [];
      existing.push(item as Record<string, unknown>);
      passwordMap.set(pw, existing);
    }
    const reusedPasswordCount = Array.from(passwordMap.values())
      .filter((g) => g.length > 1)
      .reduce((acc, g) => acc + g.length, 0);

    const recentActivity = [...items]
      .sort(
        (a, b) =>
          new Date((b as Record<string, unknown>).updated_at as string).getTime() -
          new Date((a as Record<string, unknown>).updated_at as string).getTime()
      )
      .slice(0, 10)
      .map(formatItem);

    return NextResponse.json({
      totalItems,
      totalVaults: (vaults ?? []).length,
      loginCount,
      cardCount,
      noteCount,
      identityCount,
      aliasCount,
      weakPasswordCount,
      reusedPasswordCount,
      strongPasswordCount,
      trashedCount: (trashedItems ?? []).length,
      recentActivity,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
