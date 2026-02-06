import { NextResponse } from "next/server";

export async function GET(request) {
  const apiKey = process.env.LASTFM_API_KEY;
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!apiKey) {
    return NextResponse.json(
      { error: "Last.fm API key not configured" },
      { status: 500 },
    );
  }

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 },
    );
  }

  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=50`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Last.fm API error:", errorData);
      return NextResponse.json(
        { error: "Last.fm API error" },
        { status: response.status },
      );
    }

    const data = await response.json();

    const tracks = data.recenttracks.track.map((track) => ({
      track: {
        id: track.mbid || `${track.artist["#text"]}-${track.name}`,
        name: track.name,
        artists: [{ name: track.artist["#text"] }],
        album: {
          name: track.album["#text"],
          images: track.image
            ? track.image.map((img) => ({ url: img["#text"] }))
            : [],
        },
        uri: track.url,
      },
      played_at: track.date ? track.date.uts * 1000 : Date.now(),
    }));

    // console.log(`✅ Fetched ${tracks.length} tracks from Last.fm`);

    return NextResponse.json(tracks);
  } catch (error) {
    console.error("❌ Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
