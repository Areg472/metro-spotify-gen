import HomeClient from "./HomeClient";

export const metadata = {
  title: "Metro Spotify Generator",
  description:
    "Generate a track list based on your metro route, 50 recent tracks and/or albums",
};

export default function Home() {
  return <HomeClient />;
}
