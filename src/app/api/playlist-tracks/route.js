import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  try {
    const { playlistId } = await request.json();

    if (!playlistId) {
      return NextResponse.json(
        { error: "Playlist ID required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
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
    console.log(
      `✅ Fetched ${data.items.length} tracks from playlist ${playlistId}`,
    );

    return NextResponse.json(data.items);
  } catch (error) {
    console.error("❌ Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
