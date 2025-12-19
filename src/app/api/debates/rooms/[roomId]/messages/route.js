import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { roomId } = params;
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit");
  const skip = searchParams.get("skip");
  
  const base = process.env.EXPRESS_API_BASE || "http://localhost:4000";
  
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append("limit", limit);
  if (skip) queryParams.append("skip", skip);
  
  const url = `${base}/api/debates/rooms/${roomId}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json();

  return NextResponse.json(data, { status: r.status });
}

export async function POST(req, { params }) {
  const { roomId } = params;
  const body = await req.json();
  const base = process.env.EXPRESS_API_BASE || "http://localhost:4000";
  
  const r = await fetch(`${base}/api/debates/rooms/${roomId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
