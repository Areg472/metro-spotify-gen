"use client";

import { useState, useEffect } from "react";
import { Select } from "@/components/Select";
import stations from "@/app/metro/stations";

export default function MetroClient() {
  const [recentTracks, setRecentTracks] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
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

  const cities = Object.values(stations);
  const currentStations = selectedCity
    ? Object.values(selectedCity.stations)
    : [];

  const startOptions = currentStations.filter(
    (s) => !endStation || s.name !== endStation.name,
  );
  const endOptions = currentStations.filter(
    (s) => !startStation || s.name !== startStation.name,
  );

  return (
    <div className="flex flex-col mt-4 space-y-4 items-center">
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 items-center">
        <p>City</p>
        <Select
          options={cities}
          placeholder="Select a City"
          onChange={(e) => {
            const city = cities.find((c) => c.name === e.target.value);
            setSelectedCity(city || null);
            setStartStation(null);
            setEndStation(null);
          }}
          optionClassName="text-black"
          className="text-white bg-black"
        />
      </div>

      {selectedCity && (
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <p>Start Station</p>
          <Select
            options={startOptions}
            placeholder="Select a start Station"
            onChange={(e) =>
              setStartStation(
                currentStations.find((s) => s.name === e.target.value),
              )
            }
            optionClassName="text-black"
            className="text-white bg-black"
          />
          <p>End Station</p>
          <Select
            options={endOptions}
            placeholder="Select an end Station"
            onChange={(e) =>
              setEndStation(
                currentStations.find((s) => s.name === e.target.value),
              )
            }
            optionClassName="text-black"
            className="text-white bg-black"
          />
        </div>
      )}
      {startStation && <p>Selected Start Station: {startStation.name}</p>}
      {endStation && <p>Selected End Station: {endStation.name}</p>}

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

      <div className="mt-4 flex flex-col space-y-4">
        <div className="flex flex-col space-y-2 border-t border-gray-700 pt-4">
          {messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap">
              {m.content}
            </div>
          ))}
          {isLoading && <div>AI is generating..</div>}
        </div>
      </div>
    </div>
  );
}
