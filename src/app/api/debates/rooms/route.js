import { NextResponse } from "next/server";

// In-memory storage for demo purposes
let mockRooms = [
  {
    _id: "room-1",
    title: "The Godfather: Masterpiece or Overrated?",
    topic: "Let's discuss whether The Godfather truly deserves its legendary status",
    category: "hot-takes",
    description: "A deep dive into one of cinema's most acclaimed films",
    isPinned: true,
    participants: [{ userId: "user1" }, { userId: "user2" }, { userId: "user3" }],
    messages: [
      { _id: "msg1", userId: "user1", message: "I think it's a masterpiece!" },
      { _id: "msg2", userId: "user2", message: "The pacing is too slow for modern audiences" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "room-2",
    title: "Marvel vs DC: The Ultimate Battle",
    topic: "Which cinematic universe has better storytelling?",
    category: "hot-takes",
    participants: [{ userId: "user4" }, { userId: "user5" }],
    messages: [
      { _id: "msg3", userId: "user4", message: "Marvel has better character development" },
    ],
    createdAt: new Date().toISOString(),
  },
];

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
  
  try {
    const r = await fetch(url, { cache: "no-store" });
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch (error) {
    // Fallback to mock data when backend is unavailable
    let filteredRooms = mockRooms;
    
    if (category && category !== "all") {
      filteredRooms = filteredRooms.filter(room => room.category === category);
    }
    
    return NextResponse.json({ rooms: filteredRooms });
  }
}

export async function POST(req) {
  const base = process.env.EXPRESS_API_BASE || "http://localhost:4000";
  const body = await req.json();
  
  try {
    const r = await fetch(`${base}/api/debates/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch (error) {
    // Fallback: create mock room
    const newRoom = {
      _id: `room-${Date.now()}`,
      ...body,
      participants: [{ userId: body.createdBy }],
      messages: [],
      createdAt: new Date().toISOString(),
    };
    
    mockRooms.push(newRoom);
    
    return NextResponse.json({ room: newRoom }, { status: 201 });
  }
}
