import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  try {
    const { albumId } = await request.json();

    if (!albumId) {
      return NextResponse.json(
        { error: "No album ID provided" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}/tracks`,
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

    const tracks = data.items.map((track) => ({
      track: {
        id: track.id,
        name: track.name,
        artists: track.artists,
        album: {
          name: albumId, // Will be filled with actual album data by the client
          images: [],
        },
        uri: track.uri,
      },
    }));

    console.log(`✅ Fetched ${tracks.length} tracks from album ${albumId}`);

    return NextResponse.json(tracks);
  } catch (error) {
    console.error("❌ Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
