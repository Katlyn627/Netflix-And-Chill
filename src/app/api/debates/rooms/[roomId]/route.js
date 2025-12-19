import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { roomId } = params;
  const base = process.env.EXPRESS_API_BASE || "http://localhost:4000";
  
  const r = await fetch(`${base}/api/debates/rooms/${roomId}`, { cache: "no-store" });
  const data = await r.json();

  return NextResponse.json(data, { status: r.status });
}
