import { NextRequest, NextResponse } from "next/server";

const API_BASE = "http://localhost:8080";

export async function GET() {
  const res = await fetch(`${API_BASE}/api/vaults`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${API_BASE}/api/vaults`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
