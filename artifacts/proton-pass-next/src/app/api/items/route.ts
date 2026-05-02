import { NextRequest, NextResponse } from "next/server";

const API_BASE = "http://localhost:8080";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const qs = searchParams.toString();
  const res = await fetch(`${API_BASE}/api/items${qs ? `?${qs}` : ""}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${API_BASE}/api/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
