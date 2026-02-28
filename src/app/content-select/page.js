import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ContentSelectClient from "./ContentSelectClient";

export default async function ContentSelectPage() {
  const cookieStore = await cookies();
  const lastfmUsername = cookieStore.get("lastfm_username")?.value;

  if (!lastfmUsername) {
    redirect("/");
  }

  return <ContentSelectClient />;
}
