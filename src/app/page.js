export const metadata = {
  title: "SpotiMetro",
  description:
    "This is my metro tracklist generator. Has to be one of my greatest web projects :D",
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 font-sans">
      <h1 className="text-3xl">Metro Spotify song list generator</h1>
      <p>
        Connect your Spotify to generate a track list based on your metro route,
        50 recent tracks and/or playlists :P
      </p>
      <a
        href="/api/auth/login"
        className="px-7.5 py-3.75 bg-blue-700 text-white no-underline rounded-[25px] font-bold"
      >
        Link ur spotify
      </a>
      <p className="text-white">
        Written by{" "}
        <a href="https://aregus.me" target="_blank">
          <u>Areg</u>
        </a>
      </p>
    </div>
  );
}
