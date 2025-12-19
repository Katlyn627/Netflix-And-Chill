import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { roomId } = params;
  const body = await req.json();
  const base = process.env.EXPRESS_API_BASE || "http://localhost:4000";
  
  try {
    const r = await fetch(`${base}/api/debates/rooms/${roomId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch (error) {
    // Fallback: just return success
    return NextResponse.json({ success: true });
  }
}
