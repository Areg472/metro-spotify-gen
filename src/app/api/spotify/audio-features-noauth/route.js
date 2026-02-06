import { NextResponse } from "next/server";

export async function POST(request) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  console.log("🔍 Audio features no-auth called");
  console.log("🔑 Client ID exists:", !!clientId);
  console.log("🔑 Client Secret exists:", !!clientSecret);

  if (!clientId || !clientSecret) {
    console.error("❌ Missing Spotify credentials");
    return NextResponse.json(
      { error: "Spotify credentials not configured" },
      { status: 500 },
    );
  }

  try {
    const { trackIds } = await request.json();
    console.log("🎵 Track IDs received:", trackIds?.length || 0);

    if (!trackIds || trackIds.length === 0) {
      return NextResponse.json(
        { error: "No track IDs provided" },
        { status: 400 },
      );
    }

    const validTrackIds = trackIds.filter((id) => {
      if (!id || typeof id !== "string") return false;
      if (id.includes("-") && id.length > 30) return false;
      return id.length > 0 && id.length < 100;
    });

    console.log(
      `🔍 Valid track IDs: ${validTrackIds.length} out of ${trackIds.length}`,
    );

    if (validTrackIds.length === 0) {
      return NextResponse.json(
        { error: "No valid Spotify track IDs provided" },
        { status: 400 },
      );
    }

    console.log("🔄 Fetching Spotify token...");
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

    console.log("📡 Token response status:", tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("❌ Spotify token error:", errorData);
      return NextResponse.json(
        { error: "Failed to get Spotify token", details: errorData },
        { status: tokenResponse.status },
      );
    }

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;
    console.log("✅ Token acquired successfully");

    const chunks = [];
    for (let i = 0; i < validTrackIds.length; i += 100) {
      chunks.push(validTrackIds.slice(i, i + 100));
    }

    const allFeatures = [];
    console.log(`🔄 Processing ${chunks.length} chunk(s) of track IDs`);

    for (const chunk of chunks) {
      console.log(`📡 Fetching audio features for ${chunk.length} tracks`);
      const response = await fetch(
        `https://api.spotify.com/v1/audio-features?ids=${chunk.join(",")}`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );

      console.log(`📡 Spotify API response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Spotify API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          trackCount: chunk.length,
          sampleTrackIds: chunk.slice(0, 3),
        });
        return NextResponse.json(
          {
            error: "Spotify API error",
            details: errorData,
            status: response.status,
            statusText: response.statusText,
          },
          { status: response.status },
        );
      }

      const data = await response.json();
      allFeatures.push(...data.audio_features);
      console.log(`✅ Fetched ${data.audio_features.length} audio features`);
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
