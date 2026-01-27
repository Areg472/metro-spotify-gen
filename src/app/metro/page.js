"use client";

import { useState, useEffect } from "react";
import { Select } from "@/components/Select";
import stations from "@/app/metro/stations";

export default function MetroPage() {
  const [recentTracks, setRecentTracks] = useState([]);
  const [startStation, setStartStation] = useState(null);
  const [endStation, setEndStation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (prompt) => {
    setIsLoading(true);

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
        setMessages((prev) => [...prev, newAssistantMessage]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error:", errorData);
        const errorMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: `Error: ${errorData.details || response.statusText}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
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

    const trackList = recentTracks
      .map((item) => {
        const track = item.track;
        const artists = track.artists.map((a) => a.name).join(", ");
        const duration = Math.floor(track.duration_ms / 1000);
        return `- ${track.name} by ${artists} (${duration} seconds)`;
      })
      .join("\n");

    const prompt = `I am taking a metro trip in Yerevan from ${startStation.name} to ${endStation.name}. 
Here are my 50 most recent songs from Spotify:
${trackList}

Based on the trip duration between these two stations, please recommend which songs from this list I should listen to during my journey.`;

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

  const yerevanStations = Object.values(stations.yerevan.stations);

  return (
    <div className="flex flex-row space-x-4">
      <p>Start Station</p>
      <Select
        options={yerevanStations}
        onChange={(e) =>
          setStartStation(
            yerevanStations.find((s) => s.name === e.target.value),
          )
        }
        optionClassName="text-black"
        className="text-white bg-black"
      />
      <p>End Station</p>
      <Select
        options={yerevanStations}
        onChange={(e) =>
          setEndStation(yerevanStations.find((s) => s.name === e.target.value))
        }
        optionClassName="text-black"
        className="text-white bg-black"
      />
      {startStation && <p>Selected Start Station: {startStation.name}</p>}
      {endStation && <p>Selected End Station: {endStation.name}</p>}

      <button
        onClick={handleRecommend}
        disabled={isLoading || !startStation || !endStation}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-500"
      >
        {isLoading ? "Thinking..." : "Recommend Songs"}
      </button>

      <div className="mt-8 flex flex-col space-y-4">
        <div className="flex flex-col space-y-2 border-t border-gray-700 pt-4">
          {messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap">
              <strong>{m.role === "user" ? "User: " : "AI: "}</strong>
              {m.content}
            </div>
          ))}
          {isLoading && <div>AI is thinking...</div>}
        </div>
      </div>
    </div>
  );
}
