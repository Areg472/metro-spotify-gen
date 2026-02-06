import { NextResponse } from "next/server";

export async function POST(request) {
  const apiKey = process.env.LASTFM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Last.fm API key not configured" },
      { status: 500 },
    );
  }

  try {
    const { artist, album } = await request.json();

    if (!artist || !album) {
      return NextResponse.json(
        { error: "Artist and album name are required" },
        { status: 400 },
      );
    }

    const url = `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Last.fm API error:", errorData);
      return NextResponse.json(
        { error: "Last.fm API error" },
        { status: response.status },
      );
    }

    const data = await response.json();

    if (!data.album || !data.album.tracks || !data.album.tracks.track) {
      return NextResponse.json([]);
    }

    const tracks = Array.isArray(data.album.tracks.track)
      ? data.album.tracks.track
      : [data.album.tracks.track];

    const formattedTracks = tracks.map((track) => ({
      track: {
        id: track.mbid || `${artist}-${album}-${track.name}`,
        name: track.name,
        artists: [{ name: artist }],
        album: {
          name: album,
          images: data.album.image
            ? data.album.image.map((img) => ({ url: img["#text"] }))
            : [],
        },
        uri: track.url,
        duration_ms: track.duration ? parseInt(track.duration) : 0,
      },
    }));

    // console.log(
    //   `✅ Fetched ${formattedTracks.length} tracks from Last.fm album: ${album}`,
    // );

    return NextResponse.json(formattedTracks);
  } catch (error) {
    console.error("❌ Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
