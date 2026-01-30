import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;

  const scope =
    "user-read-recently-played playlist-read-private playlist-read-collaborative";

  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(spotifyAuthUrl);
}
