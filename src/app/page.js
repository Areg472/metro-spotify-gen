export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Metro Spotify Generator</h1>
      <p>Connect your Spotify to generate tracks based on your metro route</p>
      <a
        href="/api/auth/login"
        style={{
          padding: "15px 30px",
          backgroundColor: "#1DB954",
          color: "white",
          textDecoration: "none",
          borderRadius: "25px",
          fontWeight: "bold",
        }}
      >
        🎵 Login with Spotify
      </a>
    </div>
  );
}
