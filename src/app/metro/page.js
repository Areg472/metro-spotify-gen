"use client";

import { useState, useEffect } from "react";
import { Select } from "@/components/Select";
import stations from "@/app/metro/stations";

export default function MetroPage() {
  const [recentTracks, setRecentTracks] = useState([]);
  const [startStation, setStartStation] = useState(null);
  const [endStation, setEndStation] = useState(null);

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
      <div className="mt-8">
        <h3>Recent Tracks ({recentTracks.length})</h3>
        <ul className="list-disc pl-5">
          {recentTracks.slice(0, 10).map((item, index) => (
            <li key={index}>
              {item.track.name} - {item.track.artists[0].name}
            </li>
          ))}
          {recentTracks.length > 10 && (
            <li>... and {recentTracks.length - 10} more</li>
          )}
        </ul>
      </div>
    </div>
  );
}
