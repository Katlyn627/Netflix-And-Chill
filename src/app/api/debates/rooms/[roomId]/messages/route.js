import { NextResponse } from "next/server";

// In-memory message storage for demo
let mockMessages = [
  {
    _id: "msg1",
    userId: "user1",
    username: "MovieBuff123",
    message: "I think The Godfather is an absolute masterpiece! The cinematography, the acting, the direction - everything is perfect.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "msg2",
    userId: "user2",
    username: "CinemaLover",
    message: "While I respect it as a film, I think the pacing is way too slow for modern audiences. It's a product of its time.",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    _id: "msg3",
    userId: "user3",
    username: "FilmCritic99",
    message: "The slow pacing is intentional! It builds tension and allows character development. That's what makes it timeless.",
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
];

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
  
  try {
    const r = await fetch(url, { cache: "no-store" });
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch (error) {
    // Fallback to mock messages
    return NextResponse.json({ messages: mockMessages, total: mockMessages.length });
  }
}

export async function POST(req, { params }) {
  const { roomId } = params;
  const body = await req.json();
  const base = process.env.EXPRESS_API_BASE || "http://localhost:4000";
  
  try {
    const r = await fetch(`${base}/api/debates/rooms/${roomId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch (error) {
    // Fallback: add message to mock storage
    const newMessage = {
      _id: `msg-${Date.now()}`,
      userId: body.userId,
      username: "You",
      message: body.message,
      timestamp: new Date().toISOString(),
    };
    
    mockMessages.push(newMessage);
    
    return NextResponse.json({ message: newMessage }, { status: 201 });
  }
}
