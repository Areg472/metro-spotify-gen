import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  try {
    const allTracks = [];
    let nextUrl =
      "https://api.spotify.com/v1/me/player/recently-played?limit=50";
    let pageCount = 0;

    while (allTracks.length < 200 && nextUrl) {
      pageCount++;
      console.log(`📥 Fetching page ${pageCount}...`);

      const response = await fetch(nextUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        console.error(`❌ Spotify API error: ${response.status}`);
        const errorData = await response.json();
        console.error("Error details:", errorData);
        break;
      }

      const data = await response.json();

      console.log(`   Got ${data.items.length} tracks`);
      console.log(`   Total so far: ${allTracks.length + data.items.length}`);
      console.log(`   Next URL exists: ${data.next ? "YES" : "NO"}`);

      allTracks.push(...data.items);
      nextUrl = data.next;

      if (!nextUrl) {
        console.log("⚠️ No more pages available from Spotify");
      }
    }

    console.log(`✅ Final count: ${allTracks.length} tracks`);

    return NextResponse.json(allTracks.slice(0, 200));
  } catch (error) {
    console.error("❌ Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
