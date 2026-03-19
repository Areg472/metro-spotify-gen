import { NextResponse } from "next/server";

export async function POST(request) {
  const apiKey = process.env.LASTFM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Last.fm API key not configured" },
      { status: 500 },
    );
  }

  const { tracks } = await request.json();

  if (!tracks || !Array.isArray(tracks)) {
    return NextResponse.json(
      { error: "tracks array is required" },
      { status: 400 },
    );
  }

  console.log(`[track-tags] Fetching tags for ${tracks.length} tracks`);

  const results = await Promise.all(
    tracks.map(async ({ artist, title }) => {
      try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=track.getTopTags&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&api_key=${apiKey}&format=json`;
        const res = await fetch(url);
        if (!res.ok) {
          console.warn(
            `[track-tags] Failed to fetch tags for "${title}" by ${artist}: HTTP ${res.status}`,
          );
          return { artist, title, tags: [] };
        }
        const data = await res.json();
        const tags = (data.toptags?.tag || [])
          .slice(0, 5)
          .map((t) => t.name.toLowerCase());
        console.log(
          `[track-tags] "${title}" by ${artist} → tags: [${tags.join(", ")}]`,
        );
        return { artist, title, tags };
      } catch (err) {
        console.error(
          `[track-tags] Error fetching tags for "${title}" by ${artist}:`,
          err.message,
        );
        return { artist, title, tags: [] };
      }
    }),
  );

  console.log(
    `[track-tags] Done. ${results.filter((r) => r.tags.length > 0).length}/${tracks.length} tracks have tags`,
  );

  return NextResponse.json(results);
}
