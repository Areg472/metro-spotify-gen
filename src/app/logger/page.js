"use client";

import { useEffect } from "react";

export default function Logger() {
  const fetchAndLog = async () => {
    try {
      const response = await fetch("/api/tracks");
      const tracks = await response.json();

      console.log(JSON.stringify(tracks, null, 2));
      console.log("Raw tracks array:", tracks);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchAndLog();
  }, [fetchAndLog]);

  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        fontFamily: "sans-serif",
      }}
    >
      <h1>✅ Tracks Logged!</h1>
      <p>
        Press <strong>F12</strong> and check the <strong>Console</strong> tab
      </p>
      <p>(Or right-click → Inspect → Console)</p>
    </div>
  );
}
