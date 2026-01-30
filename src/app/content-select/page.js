import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ContentSelectClient from "./ContentSelectClient";

export const metadata = {
  title: "Select Content - SpotiMetro",
  description:
    "Choose your recent tracks and playlists for metro songlist recommendations",
};

export default async function ContentSelectPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_token")?.value;

  if (!accessToken) {
    redirect("/");
  }

  return <ContentSelectClient />;
}
