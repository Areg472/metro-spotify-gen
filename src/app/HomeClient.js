"use client";

import { useState } from "react";
//hi
export default function HomeClient() {
  const [lastfmUsername, setLastfmUsername] = useState("");
  const [lastfmUsername2, setLastfmUsername2] = useState("");
  const [showSecondUser, setShowSecondUser] = useState(false);

  const handleLastfmSubmit = () => {
    if (!lastfmUsername.trim()) {
      alert("Please enter your Last.fm username");
      return;
    }
    if (showSecondUser && !lastfmUsername2.trim()) {
      alert("Please enter the second Last.fm username or remove the field");
      return;
    }
    document.cookie = `lastfm_username=${lastfmUsername.trim()}; path=/; max-age=3600`;
    if (showSecondUser) {
      document.cookie = `lastfm_username2=${lastfmUsername2.trim()}; path=/; max-age=3600`;
    } else {
      document.cookie = `lastfm_username2=; path=/; max-age=0`;
    }
    document.cookie = `music_service=lastfm; path=/; max-age=3600`;
    window.location.href = showSecondUser
      ? "/content-select?user=1"
      : "/content-select";
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

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setShowSecondUser(true)}
            disabled={showSecondUser}
            className={`w-10 h-10 rounded-full font-bold text-xl flex items-center justify-center transition-colors ${showSecondUser ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-600 text-white cursor-pointer hover:bg-gray-500"}`}
            title="Add a friend"
          >
            +
          </button>
          <button
            onClick={() => {
              setShowSecondUser(false);
              setLastfmUsername2("");
            }}
            disabled={!showSecondUser}
            className={`w-10 h-10 rounded-full font-bold text-xl flex items-center justify-center transition-colors ${!showSecondUser ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-600 text-white cursor-pointer hover:bg-gray-500"}`}
            title="Remove friend"
          >
            -
          </button>
        </div>

        {showSecondUser && (
          <input
            type="text"
            value={lastfmUsername2}
            onChange={(e) => setLastfmUsername2(e.target.value)}
            placeholder="2nd Last.fm username"
            className="px-4 py-3 rounded-lg bg-[#1a1a1a] text-white border border-gray-600 focus:border-red-700 focus:outline-none"
            onKeyPress={(e) => e.key === "Enter" && handleLastfmSubmit()}
          />
        )}

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
