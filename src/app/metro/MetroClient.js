"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/Select";
import { stations } from "@/data/stations";
import { Connector } from "@/metroui/Connector";

export default function MetroClient({ initialCityId, initialCityData }) {
  const router = useRouter();
  const [recentTracks, setRecentTracks] = useState([]);
  const [selectedCity, setSelectedCity] = useState(
    initialCityData || (initialCityId ? stations[initialCityId] : null),
  );
  const [startStation, setStartStation] = useState(null);
  const [endStation, setEndStation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (prompt) => {
    setIsLoading(true);
    setMessages([]);
    console.log("Sending to AI:", prompt);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("AI Response:", data);

        let content = data.text || "No response from AI.";
        if (content.trim().startsWith("[")) {
          try {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              content = parsed
                .map((s, i) => `${i + 1}. ${s.title} - ${s.artist}`)
                .join("\n");
            }
          } catch (e) {
            console.error("Failed to parse AI JSON response", e);
          }
        }

        const newAssistantMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: content,
        };
        setMessages([newAssistantMessage]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error:", errorData);
        const errorMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: `Error: ${errorData.details || response.statusText}`,
        };
        setMessages([errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommend = () => {
    if (!startStation || !endStation) {
      alert("Please select both start and end stations.");
      return;
    }

    if (startStation.name === endStation.name) {
      alert("Start and end stations must be different.");
      return;
    }

    const trackList = recentTracks
      .map((item) => {
        const track = item.track;
        const artists = track.artists.map((a) => a.name).join(", ");
        const totalSeconds = Math.floor(track.duration_ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `- ${track.name} by ${artists} (${minutes} minutes and ${seconds} seconds)`;
      })
      .join("\n");

    const prompt = `Metro trip: ${selectedCity?.name || "Yerevan"}, from "${startStation.name}" to "${endStation.name}".

INSTRUCTIONS:
1. First, search the web for the exact travel time between these two metro stations (riding time only, exclude waiting).
2. Select tracks from my list below whose TOTAL duration is ≤ the trip duration.
3. Prefer 2-3 shorter tracks over 1 long track when possible.
4. Pick from anywhere in the list, not just the top.
5. If trip is very short (under 3 min), a single track is fine.
6. NEVER exceed the trip duration, even by a few seconds.

My recent Spotify tracks:
${trackList}

Respond with a JSON array only: [{"title": "...", "artist": "..."}]`;

    sendMessage(prompt);
  };

  useEffect(() => {
    async function fetchTracks() {
      try {
        const response = await fetch("/api/tracks");
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched tracks:", data);
          setRecentTracks(data);
        } else {
          console.error("Failed to fetch tracks:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching tracks:", error);
      }
    }
    fetchTracks();
  }, []);

  const handleStationClick = (station) => {
    if (startStation && endStation) {
      return;
    }

    if (!startStation) {
      setStartStation(station);
      setEndStation(null);
    } else if (startStation && !endStation) {
      if (station.name !== startStation.name) {
        setEndStation(station);
      } else {
        setStartStation(null);
      }
    }
  };

  const handleReset = () => {
    setStartStation(null);
    setEndStation(null);
  };

  const cities = Object.values(stations);
  const currentStations = selectedCity
    ? Object.values(selectedCity.stations)
    : [];

  return (
    <div className="flex flex-col mt-4 space-y-4 items-center">
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 items-center">
        <p>City</p>
        <Select
          options={cities}
          placeholder="Select a City"
          value={selectedCity?.name || ""}
          onChange={(e) => {
            const cityEntry = Object.entries(stations).find(
              ([_, c]) => c.name === e.target.value,
            );
            if (cityEntry) {
              const [cityId] = cityEntry;
              router.push(`/metro/${cityId}`);
            } else {
              router.push("/metro");
            }
          }}
          optionClassName="text-black"
          className="text-white bg-black"
        />
      </div>

      {startStation && <p>Selected Start Station: {startStation.name}</p>}
      {endStation && <p>Selected End Station: {endStation.name}</p>}

      <div className="flex space-x-4">
        <button
          onClick={handleRecommend}
          disabled={
            isLoading ||
            !startStation ||
            !endStation ||
            startStation.name === endStation.name
          }
          className="h-16 w-32 bg-blue-600 cursor-pointer text-white rounded hover:bg-blue-700 disabled:bg-gray-500"
        >
          {isLoading ? "Generating..." : "Recommend Songs"}
        </button>

        {(startStation || endStation) && (
          <button
            onClick={handleReset}
            className="h-16 w-32 bg-red-600 cursor-pointer text-white rounded hover:bg-red-700"
          >
            Reset Selection
          </button>
        )}
      </div>

      {selectedCity && (
        <div className="flex flex-col items-center p-10 bg-[#1a1a1a] rounded-xl shadow-2xl mt-4 w-full max-w-5xl">
          <h2 className="text-white text-2xl font-bold mb-8">
            {selectedCity.name} Metro Map
          </h2>

          <div
            className="relative overflow-x-auto w-full pb-20"
            style={{ height: "400px" }}
          >
            <div
              style={{
                minWidth: "1000px",
                height: "100%",
                position: "relative",
                margin: "64px auto",
              }}
            >
              {Object.values(selectedCity.stations).map((s) => (
                <Connector
                  key={s.name}
                  size={selectedCity.defaultConnectorSize}
                  {...s.connector}
                  label={s.name}
                  labelBg={null}
                  onClick={() => handleStationClick(s)}
                  isSelected={startStation?.name === s.name}
                  isEndStation={endStation?.name === s.name}
                />
              ))}
              {selectedCity.extraConnectors?.map((c, i) => (
                <Connector
                  key={`extra-${i}`}
                  size={selectedCity.defaultConnectorSize}
                  {...c}
                />
              ))}
            </div>
          </div>

          <div className="mt-8 w-full border-t border-gray-700 pt-6">
            <div className="flex flex-col space-y-2">
              {messages.map((m) => (
                <div key={m.id} className="whitespace-pre-wrap text-white">
                  {m.content}
                </div>
              ))}
              {isLoading && (
                <div className="text-gray-400">AI is generating..</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
