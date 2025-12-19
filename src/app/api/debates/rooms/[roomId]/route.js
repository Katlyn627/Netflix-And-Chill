import { NextResponse } from "next/server";

const mockRoom = {
  _id: "room-1",
  title: "The Godfather: Masterpiece or Overrated?",
  topic: "Let's discuss whether The Godfather truly deserves its legendary status",
  category: "hot-takes",
  description: "A deep dive into one of cinema's most acclaimed films",
  isPinned: true,
  participants: [
    { userId: { displayName: "MovieBuff123" } },
    { userId: { displayName: "CinemaLover" } },
    { userId: { displayName: "FilmCritic99" } },
  ],
  messages: [],
  createdAt: new Date().toISOString(),
};

export async function GET(req, { params }) {
  const { roomId } = params;
  const base = process.env.EXPRESS_API_BASE || "http://localhost:4000";
  
  try {
    const r = await fetch(`${base}/api/debates/rooms/${roomId}`, { cache: "no-store" });
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch (error) {
    // Fallback to mock data
    return NextResponse.json({ room: mockRoom });
  }
}
