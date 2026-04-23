"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
//bla
//bla 2
export default function ContentSelectClient() {
  const router = useRouter();
  const [recentTracks, setRecentTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectAllTracks, setSelectAllTracks] = useState(false);
  const [selectTopCountryTracks, setSelectTopCountryTracks] = useState(false);
  const [selectedAlbums, setSelectedAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastfmUsername, setLastfmUsername] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
      };

      const username = getCookie("lastfm_username");
      setLastfmUsername(username);

      try {
        let tracksData = [];
        let albumsData = [];

        const tracksResponse = await fetch(
          `/api/lastfm/recent-tracks?username=${username}`,
        );
        if (tracksResponse.ok) {
          tracksData = await tracksResponse.json();
          setRecentTracks(tracksData);
        } else {
          console.error(
            "Failed to fetch Last.fm tracks:",
            tracksResponse.statusText,
          );
        }

        const albumsResponse = await fetch(
          `/api/lastfm/top-albums?username=${username}`,
        );
        if (albumsResponse.ok) {
          albumsData = await albumsResponse.json();
          setAlbums(albumsData);
        } else {
          console.error(
            "Failed to fetch Last.fm albums:",
            albumsResponse.statusText,
          );
        }

        if (tracksData.length === 0 && albumsData.length === 0) {
          router.push("/");
          return;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const handleAlbumToggle = (albumId) => {
    setSelectedAlbums((prev) =>
      prev.includes(albumId)
        ? prev.filter((id) => id !== albumId)
        : [...prev, albumId],
    );
  };

  const handleNext = async () => {
    setIsLoading(true);

    try {
      const selectedTracksData = selectAllTracks ? recentTracks : [];

      const selectedAlbumsData = albums.filter((album) =>
        selectedAlbums.includes(album.id),
      );

      let allContentTracks = [];

      for (const album of selectedAlbumsData) {
        const response = await fetch("/api/lastfm/album-tracks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artist: album.artist, album: album.name }),
        });

        if (response.ok) {
          const tracks = await response.json();
          allContentTracks = [...allContentTracks, ...tracks];
        } else {
          console.error(
            `Failed to fetch tracks for Last.fm album: ${album.name}`,
          );
        }
      }

      const combinedTracks = [...selectedTracksData, ...allContentTracks];

      const dataToSend = {
        tracks: combinedTracks,
        content: selectedAlbumsData,
        selectTopCountryTracks: selectTopCountryTracks,
      };

      sessionStorage.setItem("selectedContent", JSON.stringify(dataToSend));

      router.push("/metro");
    } catch (error) {
      console.error("Error fetching content tracks:", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading your content...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 font-sans p-8">
      <h1 className="text-3xl">Select Your Content</h1>
      <p>Choose your recent tracks and albums to use for recommendations</p>
      {lastfmUsername && (
        <p className="text-sm text-gray-400">
          Using Last.fm data for: {lastfmUsername}
        </p>
      )}

      <div className="w-full max-w-4xl space-y-8">
        <div className="bg-[#1a1a1a] p-6 rounded-xl">
          <h2 className="text-2xl mb-4 text-white">Recent 50 Tracks</h2>
          <label className="flex items-center text-white gap-3 p-2 hover:bg-[#2a2a2a] rounded cursor-pointer">
            <input
              type="checkbox"
              checked={selectAllTracks}
              onChange={(e) => setSelectAllTracks(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <span>Select all 50 recent tracks</span>
          </label>
          <label className="flex items-center text-white gap-3 p-2 hover:bg-[#2a2a2a] rounded cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={selectTopCountryTracks}
              onChange={(e) => setSelectTopCountryTracks(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <span>Select all Top 50 tracks in the selected country</span>
          </label>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-xl">
          <h2 className="text-2xl mb-4 text-white">
            Your Top Albums/EPs/Singles
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {albums.map((album) => (
              <label
                key={album.id}
                className="flex items-center text-white gap-3 p-2 hover:bg-[#2a2a2a] rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedAlbums.includes(album.id)}
                  onChange={() => handleAlbumToggle(album.id)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>
                  {album.name} - {album.artist}
                  {album.playcount && ` (${album.playcount} plays)`}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="px-7.5 py-3.75 bg-blue-700 text-white rounded-[25px] font-bold cursor-pointer hover:bg-blue-800 mt-4"
      >
        Next
      </button>
    </div>
  );
}
