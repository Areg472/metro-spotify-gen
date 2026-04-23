import { NextResponse } from "next/server";

export async function GET(request) {
  const apiKey = process.env.LASTFM_API_KEY;
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");

  if (!apiKey) {
    return NextResponse.json({ error: "Last.fm API key not configured" }, { status: 500 });
  }

  if (!country) {
    return NextResponse.json({ error: "Missing country parameter" }, { status: 400 });
  }

  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&country=${encodeURIComponent(country)}&api_key=${apiKey}&format=json&limit=50`;
    const response = await fetch(url);
    if (!response.ok) {
      // API error
      return NextResponse.json({ error: "Last.fm API error" }, { status: response.status });
    }
    const data = await response.json();

    if (!data.tracks || !data.tracks.track) {
      return NextResponse.json([]);
    }

    const tracks = data.tracks.track.map((track) => ({
      track: {
        id: track.mbid || `${track.artist.name}-${track.name}`,
        name: track.name,
        artists: [{ name: track.artist.name }],
        album: { name: "", images: [] }, // Geo track might not have album info immediately available in the same format
        uri: track.url,
        duration_ms: track.duration ? parseInt(track.duration) * 1000 : 0, // ensure in ms? Wait, recent-tracks duration is 0 usually. Let's make it 0 if missing.
      },
      played_at: Date.now(),
    }));

    return NextResponse.json(tracks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch top tracks for country" }, { status: 500 });
  }
}
