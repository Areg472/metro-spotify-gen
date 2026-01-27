"use client";

import { useState, useEffect } from "react";
import { Select } from "@/components/Select";
import stations from "@/app/metro/stations";
import { useChat } from "@ai-sdk/react";

export default function MetroPage() {
  const [recentTracks, setRecentTracks] = useState([]);
  const [startStation, setStartStation] = useState(null);
  const [endStation, setEndStation] = useState(null);
  const [chatInput, setChatInput] = useState("");

  const { messages, append: sendMessage } = useChat({
    api: "/api/chat",
  });

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

      <div className="mt-8 flex flex-col space-y-4">
        <div className="flex flex-col space-y-2 border-t border-gray-700 pt-4">
          {messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap">
              <strong>{m.role === "user" ? "User: " : "AI: "}</strong>
              {m.parts ? (
                m.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return <span key={`${m.id}-${i}`}>{part.text}</span>;
                    default:
                      return null;
                  }
                })
              ) : (
                <span>{m.content}</span>
              )}
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage({ role: "user", content: chatInput });
            setChatInput("");
          }}
          className="flex flex-row space-x-2"
        >
          <input
            className="flex-1 p-2 text-white bg-black border border-gray-700 rounded"
            value={chatInput}
            placeholder="Ask something..."
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
