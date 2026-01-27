"use client";

import { useState } from "react";
import { Select } from "@/components/Select";
import stations from "@/app/metro/stations";

export default function MetroPage() {
  const [startStation, setStartStation] = useState(null);
  const [endStation, setEndStation] = useState(null);

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
        className="text-black"
      />
      <p>End Station</p>
      <Select
        options={yerevanStations}
        onChange={(e) =>
          setEndStation(yerevanStations.find((s) => s.name === e.target.value))
        }
        className="text-black"
      />
      {startStation && <p>Selected Start Station: {startStation.name}</p>}
      {endStation && <p>Selected End Station: {endStation.name}</p>}
    </div>
  );
}
