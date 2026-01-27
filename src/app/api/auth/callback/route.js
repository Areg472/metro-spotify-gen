import { NextResponse } from "next/server";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUrl,
      }),
    });

    const data = await response.json();

    console.log("Got access token:", data.access_token ? "YES" : "NO");

    const { access_token } = data;

    const response2 = NextResponse.redirect(new URL("/logger", request.url));

    response2.cookies.set("spotify_token", access_token, {
      httpOnly: false,
      path: "/",
      sameSite: "lax",
      maxAge: 3600,
    });

    console.log("Cookie set, redirecting to /logger");

    return response2;
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
