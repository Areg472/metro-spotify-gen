import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import MetroClient from "../MetroClient";

export async function generateMetadata({ params }) {
  const { cityname } = await params;
  const cityId = cityname.toLowerCase();

  try {
    const { [cityId]: city } = await import(`@/data/stations/${cityId}`);

    if (!city) {
      return { title: "City Not Found" };
    }

    return {
      title: `${city.name} Metro - Metro Spotify Generator`,
      description: `Generate a Spotify track list for ${city.name} metro.`,
    };
  } catch (e) {
    return { title: "City Not Found" };
  }
}

export default async function CityMetroPage({ params }) {
  const cookieStore = await cookies();
  const spotifyToken = cookieStore.get("spotify_token")?.value;
  const lastfmUsername = cookieStore.get("lastfm_username")?.value;

  if (!spotifyToken || !lastfmUsername) {
    redirect("/");
  }

  const { cityname } = await params;
  const cityId = cityname.toLowerCase();

  try {
    const cityData = await import(`@/data/stations/${cityId}`);
    const city = cityData[cityId];

    if (!city) {
      notFound();
    }

    return <MetroClient initialCityId={cityId} initialCityData={city} />;
  } catch (e) {
    notFound();
  }
}
