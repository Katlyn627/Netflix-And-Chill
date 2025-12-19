import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const base = process.env.EXPRESS_API_BASE || "http://localhost:4000";
  
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (status) params.append("status", status);
  if (search) params.append("search", search);

  const url = `${base}/api/debates/rooms${params.toString() ? `?${params.toString()}` : ""}`;
  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json();

  return NextResponse.json(data, { status: r.status });
}

export async function POST(req) {
  const base = process.env.EXPRESS_API_BASE || "http://localhost:4000";
  const body = await req.json();
  
  const r = await fetch(`${base}/api/debates/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
