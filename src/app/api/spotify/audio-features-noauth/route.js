import { NextResponse } from "next/server";

export async function POST(request) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Spotify credentials not configured" },
      { status: 500 },
    );
  }

  try {
    const { trackIds } = await request.json();

    if (!trackIds || trackIds.length === 0) {
      return NextResponse.json(
        { error: "No track IDs provided" },
        { status: 400 },
      );
    }

    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
      },
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Spotify token error:", errorData);
      return NextResponse.json(
        { error: "Failed to get Spotify token", details: errorData },
        { status: tokenResponse.status },
      );
    }

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;

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
