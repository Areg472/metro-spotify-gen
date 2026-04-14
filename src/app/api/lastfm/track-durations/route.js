import { NextResponse } from "next/server";

export async function POST(request) {
  const apiKey = process.env.LASTFM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Last.fm API key not configured" },
      { status: 500 },
    );
  }

  try {
    const { tracks } = await request.json();

    if (!Array.isArray(tracks) || tracks.length === 0) {
      return NextResponse.json(
        { error: "tracks array is required" },
        { status: 400 },
      );
    }

    const results = await Promise.all(
      tracks.map(async ({ artist, title }) => {
        try {
          const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&format=json`;
          const response = await fetch(url);
          if (!response.ok) {
            return { artist, title, durationSeconds: 0 };
          }
          const data = await response.json();
          const durationMs = parseInt(data.track?.duration || "0", 10);
          return {
            artist,
            title,
            durationSeconds: Math.round(durationMs / 1000),
          };
        } catch {
          return { artist, title, durationSeconds: 0 };
        }
      }),
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("❌ Error fetching track durations:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
