import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.EXPRESS_API_BASE || "http://localhost:4000";
  const r = await fetch(`${base}/health`, { cache: "no-store" });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
