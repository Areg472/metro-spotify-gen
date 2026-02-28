import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MetroClient from "./MetroClient";

export const metadata = {
  title: "Metro Route - Metro Spotify Generator",
  description:
    "Select your metro route and get AI-powered track recommendations",
};

export default async function MetroPage() {
  const cookieStore = await cookies();
  const lastfmUsername = cookieStore.get("lastfm_username")?.value;

  /*if (!lastfmUsername) {
    redirect("/");
  }*/

  return <MetroClient />;
}
