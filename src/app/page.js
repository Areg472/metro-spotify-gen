export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 font-sans">
      <h1>Metro Spotify song list generator</h1>
      <p>
        Connect your Spotify to generate a track list based on your metro route,
        and 50 recent tracks :P
      </p>
      <a
        href="/api/auth/login"
        className="px-7.5 py-3.75 bg-blue-700 text-white no-underline rounded-[25px] font-bold"
      >
        Link ur spotify
      </a>
    </div>
  );
}
