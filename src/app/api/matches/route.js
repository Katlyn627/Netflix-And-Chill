import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const base = process.env.EXPRESS_API_BASE || "http://localhost:4000";
  const r = await fetch(`${base}/api/matches/candidates/${userId}`, { cache: "no-store" });
  const data = await r.json();

  return NextResponse.json(data, { status: r.status });
}
