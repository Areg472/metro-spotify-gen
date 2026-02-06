import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { trackIds } = await request.json();

    if (!trackIds || trackIds.length === 0) {
      return NextResponse.json(
        { error: "No track IDs provided" },
        { status: 400 },
      );
    }

    const tokenResponse = await fetch(
      `${process.env.NEXT_PUBLIC_REDIRECT_URL?.replace("/api/auth/callback", "") || "http://localhost:8888"}/api/spotify/client-token`,
    );

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: "Failed to get Spotify token" },
        { status: 500 },
      );
    }

    const { access_token } = await tokenResponse.json();

    const chunks = [];
    for (let i = 0; i < trackIds.length; i += 100) {
      chunks.push(trackIds.slice(i, i + 100));
    }

    const allFeatures = [];
    for (const chunk of chunks) {
      const response = await fetch(
        `https://api.spotify.com/v1/audio-features?ids=${chunk.join(",")}`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
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

    console.log(
      `✅ Fetched audio features for ${allFeatures.length} tracks (no auth)`,
    );

    return NextResponse.json(allFeatures);
  } catch (error) {
    console.error("❌ Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
