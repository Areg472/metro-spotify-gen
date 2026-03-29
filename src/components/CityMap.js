"use client";
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { stations } from "@/data/stations";

// Session-level cache — survives component re-mounts but clears when the tab is closed
const SESSION_KEY = "cityCoords";
let cachedCoordsMap = (() => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();
let savedZoom = 2;
let savedCenter = [30, 20];

function ZoomTracker() {
  const map = useMap();
  useEffect(() => {
    const save = () => {
      savedZoom = map.getZoom();
      const c = map.getCenter();
      savedCenter = [c.lat, c.lng];
    };
    map.on("moveend zoomend", save);
    return () => map.off("moveend zoomend", save);
  }, [map]);
  return null;
}

export default function CityMap({ selectedCityId, onCitySelect }) {
  const cityEntries = Object.entries(stations);
  const [coordsMap, setCoordsMap] = useState(cachedCoordsMap || {});

  useEffect(() => {
    if (cachedCoordsMap) return;

    const payload = cityEntries.map(([id, cityData]) => ({
      id,
      name: cityData.name,
      country: cityData.country || null,
    }));

    fetch("/api/geocode/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        cachedCoordsMap = data;
        try {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
        } catch {}
        setCoordsMap(data);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-gray-700"
      style={{ height: "420px" }}
    >
      <MapContainer
        center={savedCenter}
        zoom={savedZoom}
        style={{ height: "100%", width: "100%", background: "#1a1a1a" }}
        scrollWheelZoom={true}
        fadeAnimation={false}
        markerZoomAnimation={false}
      >
        <ZoomTracker />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {cityEntries.map(([cityId, cityData]) => {
          const coords = coordsMap[cityId];
          if (!coords) return null;
          const isSelected = cityId === selectedCityId;
          return (
            <CircleMarker
              key={cityId}
              center={coords}
              radius={isSelected ? 12 : 8}
              pathOptions={{
                color: isSelected ? "#ef4444" : "#3b82f6",
                fillColor: isSelected ? "#ef4444" : "#3b82f6",
                fillOpacity: isSelected ? 1 : 0.75,
                weight: isSelected ? 3 : 1,
              }}
              eventHandlers={{
                click: () => onCitySelect(cityId),
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                <span style={{ fontWeight: "bold" }}>{cityData.name}</span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
