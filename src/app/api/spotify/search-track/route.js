import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { tracks } = await request.json();

    if (!tracks || tracks.length === 0) {
      return NextResponse.json(
        { error: "No tracks provided" },
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
