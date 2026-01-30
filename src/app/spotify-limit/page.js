export default function SpotifyLimitPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 font-sans p-8">
      <h1 className="text-3xl">Spotify API...</h1>
      <p className="text-center max-w-2xl">
        It looks like the Spotify API returned no data. This is because of their
        new API{" "}
        <a href="https://spotify.leemartin.com/" target="_blank">
          <u>requirements</u>
        </a>
        .
      </p>
      <p className="text-center max-w-2xl">
        Please fill out the form below to be added to the allowlist:
      </p>
      <a
        href="https://fluffy-tomato-37d.notion.site/2f87441671d6801eada0c7347dc8a7e4?pvs=105"
        target="_blank"
        rel="noopener noreferrer"
        className="px-7.5 py-3.75 bg-blue-700 text-white rounded-[25px] font-bold cursor-pointer hover:bg-blue-800 mt-4"
      >
        Click here to fill out the form
      </a>
    </div>
  );
}
