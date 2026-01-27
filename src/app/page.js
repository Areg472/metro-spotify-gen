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
      <h1>Spotify Track Logger</h1>
      <p>Log your 50 recent tracks to browser console</p>
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
        🎵 Login & Log Tracks
      </a>
    </div>
  );
}
