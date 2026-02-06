import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ContentSelectClient from "./ContentSelectClient";

export default async function ContentSelectPage() {
  const cookieStore = await cookies();
  const spotifyToken = cookieStore.get("spotify_token")?.value;
  const lastfmUsername = cookieStore.get("lastfm_username")?.value;

  if (!spotifyToken || !lastfmUsername) {
    redirect("/");
  }

  return <ContentSelectClient />;
}
