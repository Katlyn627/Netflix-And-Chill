import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const base = process.env.EXPRESS_API_BASE || "http://localhost:4000";
  const url = `${base}/api/debates/topics${category ? `?category=${category}` : ""}`;
  
  try {
    const r = await fetch(url, { cache: "no-store" });
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch (error) {
    // Fallback mock data when backend is unavailable
    const mockTopics = [
      {
        id: "hot-take-1",
        category: "hot-takes",
        title: "The Godfather is Overrated",
        description: "Let's debate if The Godfather deserves its #1 spot in cinema history",
        icon: "🔥",
      },
      {
        id: "hot-take-2",
        category: "hot-takes",
        title: "Marvel vs DC: The Ultimate Showdown",
        description: "Which cinematic universe reigns supreme?",
        icon: "⚡",
      },
      {
        id: "director-1",
        category: "director-showdown",
        title: "Nolan vs Tarantino",
        description: "Who is the better director of our generation?",
        icon: "🎬",
      },
      {
        id: "genre-1",
        category: "genre-debate",
        title: "Horror: Jump Scares vs Psychological Terror",
        description: "What makes a truly scary horror film?",
        icon: "👻",
      },
      {
        id: "decade-1",
        category: "best-of-decade",
        title: "Best Movies of the 2010s",
        description: "What films defined the decade?",
        icon: "📅",
      },
      {
        id: "overrated-1",
        category: "overrated-underrated",
        title: "Most Overrated Movie of All Time",
        description: "Which critically acclaimed film doesn't deserve the hype?",
        icon: "📉",
      },
    ];

    const filteredTopics = category 
      ? mockTopics.filter(t => t.category === category)
      : mockTopics;

    return NextResponse.json({ topics: filteredTopics });
  }
}
