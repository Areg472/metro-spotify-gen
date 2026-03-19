import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import MetroClient from "../MetroClient";
import stations from "@/data/stations";

export async function generateMetadata({ params }) {
  const { cityname } = await params;
  const cityId = cityname.toLowerCase();

  const cityEntry = Object.entries(stations).find(
    ([key]) => key.toLowerCase() === cityId,
  );

  if (!cityEntry) {
    return { title: "City Not Found" };
  }

  const city = cityEntry[1];

  return {
    title: `${city.name} Metro - Metro Spotify Generator`,
    description: `Generate a Spotify track list for ${city.name} metro.`,
  };
}

export default async function CityMetroPage({ params }) {
  const cookieStore = await cookies();
  const lastfmUsername = cookieStore.get("lastfm_username")?.value;

  if (!lastfmUsername) {
    redirect("/");
  }

  const { cityname } = await params;
  const cityId = cityname.toLowerCase();

  const cityEntry = Object.entries(stations).find(
    ([key]) => key.toLowerCase() === cityId,
  );

  if (!cityEntry) {
    notFound();
  }

  const [resolvedCityId, city] = cityEntry;

  return <MetroClient initialCityId={resolvedCityId} initialCityData={city} />;
}
