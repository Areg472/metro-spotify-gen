"use client";

import { useState } from "react";
//hi
export default function HomeClient() {
  const [lastfmUsername, setLastfmUsername] = useState("");

  const handleLastfmSubmit = () => {
    if (!lastfmUsername.trim()) {
      alert("Please enter your Last.fm username");
      return;
    }
    document.cookie = `lastfm_username=${lastfmUsername.trim()}; path=/; max-age=3600`;
    document.cookie = `music_service=lastfm; path=/; max-age=3600`;
    window.location.href = "/content-select";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 font-sans">
      <h1 className="text-3xl">Metro song list generator</h1>
      <p>
        Enter your Last.fm username to generate a track list based on your metro
        route, 50 recent tracks and/or albums :P
      </p>

      <div className="flex flex-col gap-4 mt-4 w-full max-w-md">
        <h2 className="text-xl text-center">Enter your Last.fm username</h2>
        <input
          type="text"
          value={lastfmUsername}
          onChange={(e) => setLastfmUsername(e.target.value)}
          placeholder="Last.fm username"
          className="px-4 py-3 rounded-lg bg-[#1a1a1a] text-white border border-gray-600 focus:border-red-700 focus:outline-none"
          onKeyPress={(e) => e.key === "Enter" && handleLastfmSubmit()}
        />
        <button
          onClick={handleLastfmSubmit}
          className="px-4 py-3 bg-red-700 text-white rounded-[25px] font-bold cursor-pointer hover:bg-red-800"
        >
          Continue
        </button>
      </div>

      <p className="text-white mt-8">
        Written by{" "}
        <a href="https://aregus.me" target="_blank">
          <u>Areg</u>
        </a>
      </p>
    </div>
  );
}
