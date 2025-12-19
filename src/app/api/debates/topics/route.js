import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const base = process.env.EXPRESS_API_BASE || "http://localhost:4000";
  const url = `${base}/api/debates/topics${category ? `?category=${category}` : ""}`;
  
  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json();

  return NextResponse.json(data, { status: r.status });
}
