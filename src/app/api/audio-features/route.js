import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  try {
    const { trackIds } = await request.json();

    if (!trackIds || trackIds.length === 0) {
      return NextResponse.json(
        { error: "No track IDs provided" },
        { status: 400 },
      );
    }

    // Spotify API allows up to 100 track IDs per request
    const chunks = [];
    for (let i = 0; i < trackIds.length; i += 100) {
      chunks.push(trackIds.slice(i, i + 100));
    }

    const allFeatures = [];
    for (const chunk of chunks) {
      const response = await fetch(
        `https://api.spotify.com/v1/audio-features?ids=${chunk.join(",")}`,
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
      allFeatures.push(...data.audio_features);
    }

    console.log(`✅ Fetched audio features for ${allFeatures.length} tracks`);

    return NextResponse.json(allFeatures);
  } catch (error) {
    console.error("❌ Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
