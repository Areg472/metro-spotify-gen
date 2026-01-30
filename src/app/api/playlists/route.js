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
      "https://api.spotify.com/v1/me/playlists?limit=50",
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
    console.log(`✅ Fetched ${data.items.length} playlists`);

    return NextResponse.json(data.items);
  } catch (error) {
    console.error("❌ Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
