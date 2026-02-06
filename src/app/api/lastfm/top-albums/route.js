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
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${username}&api_key=${apiKey}&format=json&limit=50`;

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

    const albums = data.topalbums.album.map((album) => ({
      id: album.mbid || `${album.artist.name}-${album.name}`,
      name: album.name,
      artist: album.artist.name,
      images: album.image
        ? album.image.map((img) => ({ url: img["#text"] }))
        : [],
      playcount: album.playcount,
      url: album.url,
    }));

    console.log(`✅ Fetched ${albums.length} top albums from Last.fm`);

    return NextResponse.json(albums);
  } catch (error) {
    console.error("❌ Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
