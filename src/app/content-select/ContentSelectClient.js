"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ContentSelectClient() {
  const router = useRouter();
  const [recentTracks, setRecentTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectAllTracks, setSelectAllTracks] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const tracksResponse = await fetch("/api/tracks");
        let tracksData = [];
        if (tracksResponse.ok) {
          tracksData = await tracksResponse.json();
          console.log("Fetched recent tracks:", tracksData);
          setRecentTracks(tracksData);
        } else {
          /*console.error("Failed to fetch tracks:", tracksResponse.statusText);*/
        }

        const playlistsResponse = await fetch("/api/playlists");
        let playlistsData = [];
        if (playlistsResponse.ok) {
          playlistsData = await playlistsResponse.json();
          console.log("Fetched playlists:", playlistsData);
          setPlaylists(playlistsData);
        } else {
          console.error(
            "Failed to fetch playlists:",
            playlistsResponse.statusText,
          );
        }

        // Redirect to spotify-limit if both arrays are empty
        if (tracksData.length === 0 && playlistsData.length === 0) {
          router.push("/spotify-limit");
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

  const handlePlaylistToggle = (playlistId) => {
    setSelectedPlaylists((prev) =>
      prev.includes(playlistId)
        ? prev.filter((id) => id !== playlistId)
        : [...prev, playlistId],
    );
  };

  const handleNext = async () => {
    setIsLoading(true);

    try {
      const selectedTracksData = selectAllTracks ? recentTracks : [];
      const selectedPlaylistsData = playlists.filter((playlist) =>
        selectedPlaylists.includes(playlist.id),
      );

      let allPlaylistTracks = [];
      for (const playlist of selectedPlaylistsData) {
        const response = await fetch("/api/playlist-tracks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playlistId: playlist.id }),
        });

        if (response.ok) {
          const tracks = await response.json();
          allPlaylistTracks = [...allPlaylistTracks, ...tracks];
          /* console.log(
            `Fetched ${tracks.length} tracks from playlist: ${playlist.name}`,
          );*/
        } else {
          console.error(
            `Failed to fetch tracks for playlist: ${playlist.name}`,
          );
        }
      }

      const combinedTracks = [...selectedTracksData, ...allPlaylistTracks];

      const dataToSend = {
        tracks: combinedTracks,
        playlists: selectedPlaylistsData,
      };

      /* console.log("Selected data JSON:", JSON.stringify(dataToSend, null, 2));*/

      sessionStorage.setItem("selectedContent", JSON.stringify(dataToSend));

      router.push("/metro");
    } catch (error) {
      console.error("Error fetching playlist tracks:", error);
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
      <p>Choose your recent tracks and playlists to use for recommendations</p>

      <div className="w-full max-w-4xl space-y-8">
        <div className="bg-[#1a1a1a] p-6 rounded-xl">
          <h2 className="text-2xl mb-4">Recent 50 Tracks</h2>
          <label className="flex items-center gap-3 p-2 hover:bg-[#2a2a2a] rounded cursor-pointer">
            <input
              type="checkbox"
              checked={selectAllTracks}
              onChange={(e) => setSelectAllTracks(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <span>Select all 50 recent tracks</span>
          </label>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-xl">
          <h2 className="text-2xl mb-4">Your Playlists</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {playlists.map((playlist) => (
              <label
                key={playlist.id}
                className="flex items-center gap-3 p-2 hover:bg-[#2a2a2a] rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPlaylists.includes(playlist.id)}
                  onChange={() => handlePlaylistToggle(playlist.id)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>
                  {playlist.name} ({playlist.tracks.total} tracks)
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
