import { NextResponse } from "next/server";

const API_BASE = "http://localhost:8080";

export async function GET() {
  const res = await fetch(`${API_BASE}/api/stats/reused-passwords`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
