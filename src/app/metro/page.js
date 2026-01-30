import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MetroClient from "./MetroClient";

export const metadata = {
  title: "Metro Spotify Generator",
  description:
    "Generate a Spotify track list based on your metro trip, 50 recent songs and/or playlists. Written by Areg :D",
};

export default async function MetroPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_token")?.value;

  if (!accessToken) {
    redirect("/");
  }

  return <MetroClient />;
}
