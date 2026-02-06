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
    const { tracks } = await request.json();

    if (!tracks || tracks.length === 0) {
      return NextResponse.json(
        { error: "No tracks provided" },
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

    const searchResults = [];
    for (const track of tracks) {
      const query = encodeURIComponent(
        `track:${track.name} artist:${track.artist}`,
      );
      const searchUrl = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;

      const response = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tracks && data.tracks.items && data.tracks.items.length > 0) {
          const spotifyTrack = data.tracks.items[0];
          searchResults.push({
            originalId: track.id,
            spotifyId: spotifyTrack.id,
            found: true,
          });
        } else {
          searchResults.push({
            originalId: track.id,
            spotifyId: null,
            found: false,
          });
        }
      } else {
        searchResults.push({
          originalId: track.id,
          spotifyId: null,
          found: false,
        });
      }
    }

    console.log(
      `✅ Searched ${tracks.length} tracks, found ${searchResults.filter((r) => r.found).length} on Spotify`,
    );

    return NextResponse.json(searchResults);
  } catch (error) {
    console.error("❌ Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
