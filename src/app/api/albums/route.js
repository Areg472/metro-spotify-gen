import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/albums?limit=50",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Spotify API error:", errorData);
      return NextResponse.json(
        { error: "Spotify API error" },
        { status: response.status },
      );
    }

    const data = await response.json();

    const albums = data.items.map((item) => ({
      id: item.album.id,
      name: item.album.name,
      artist: item.album.artists[0].name,
      images: item.album.images,
      total_tracks: item.album.total_tracks,
      uri: item.album.uri,
    }));

    console.log(`✅ Fetched ${albums.length} albums`);

    return NextResponse.json(albums);
  } catch (error) {
    console.error("❌ Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
