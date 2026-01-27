"use client";

import { useState } from "react";
import { Select } from "@/components/Select";
import stations from "@/app/metro/stations";

export default function MetroPage() {
  const [startStation, useStartStation] = useState(null);
  const [endStation, useEndStation] = useState(null);

  const yerevanStations = stations.yerevan.stations;

  return (
    <div className="flex flex-row">
      <p>Start Station</p>
      <Select options={yerevanStations} onChange={useStartStation} />
      <p>End Station</p>
      <Select options={yerevanStations} onChange={useEndStation} />
      {startStation && <p>Selected Start Station: {startStation.name}</p>}
      {endStation && <p>Selected End Station: {endStation.name}</p>}
    </div>
  );
}
