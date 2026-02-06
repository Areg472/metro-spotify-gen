"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomeClient() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState(null);
  const [lastfmUsername, setLastfmUsername] = useState("");
  const [showUsernameInput, setShowUsernameInput] = useState(false);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    if (service === "spotify") {
      document.cookie = `lastfm_username=; path=/; max-age=0`;
      document.cookie = `music_service=; path=/; max-age=0`;
      window.location.href = "/api/auth/login";
    } else if (service === "lastfm") {
      setShowUsernameInput(true);
    }
  };

  const handleLastfmSubmit = () => {
    if (!lastfmUsername.trim()) {
      alert("Please enter your Last.fm username");
      return;
    }
    document.cookie = `spotify_token=; path=/; max-age=0`;
    document.cookie = `lastfm_username=${lastfmUsername.trim()}; path=/; max-age=3600`;
    document.cookie = `music_service=lastfm; path=/; max-age=3600`;
    window.location.href = "/content-select";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 font-sans">
      <h1 className="text-3xl">Metro Spotify song list generator</h1>
      <p>
        Choose your music service to generate a track list based on your metro
        route, 50 recent tracks and/or albums :P
      </p>

      {!showUsernameInput ? (
        <div className="flex flex-col gap-4 mt-4">
          <button
            onClick={() => handleServiceSelect("spotify")}
            className="px-7.5 py-3.75 bg-blue-700 text-white rounded-[25px] font-bold cursor-pointer hover:bg-blue-800"
          >
            Use Spotify
          </button>

          <button
            onClick={() => handleServiceSelect("lastfm")}
            className="px-7.5 py-3.75 bg-red-700 text-white rounded-[25px] font-bold cursor-pointer hover:bg-red-800"
          >
            Use Last.fm
          </button>
        </div>
      ) : (
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
          <div className="flex gap-3">
            <button
              onClick={() => setShowUsernameInput(false)}
              className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-[25px] font-bold cursor-pointer hover:bg-gray-800"
            >
              Back
            </button>
            <button
              onClick={handleLastfmSubmit}
              className="flex-1 px-4 py-3 bg-red-700 text-white rounded-[25px] font-bold cursor-pointer hover:bg-red-800"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <p className="text-white mt-8">
        Written by{" "}
        <a href="https://aregus.me" target="_blank">
          <u>Areg</u>
        </a>
      </p>
    </div>
  );
}
