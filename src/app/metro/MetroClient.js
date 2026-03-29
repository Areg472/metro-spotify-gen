"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { stations } from "@/data/stations";
import { Connector } from "@/metroui/Connector";
import dynamic from "next/dynamic";
const CityMap = dynamic(() => import("@/components/CityMap"), { ssr: false });

function SkeletonSongListInline({ count = 5 }) {
  return (
    <div className="flex flex-col space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="flex flex-col space-y-1.5 flex-1">
            <div className="skeleton h-3.5" style={{ width: `250px` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonMetroMapInline() {
  return (
    <div className="flex flex-col items-center p-10 bg-[#1a1a1a] rounded-xl shadow-2xl mt-4 w-full max-w-5xl">
      <div className="skeleton h-7 w-48 mb-8" />
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "400px" }}
      >
        <div
          className="skeleton absolute"
          style={{ left: 40, top: "45%", width: "85%", height: 8 }}
        />
        <div
          className="skeleton absolute"
          style={{ left: "72%", top: "20%", width: 8, height: "55%" }}
        />
        {[80, 200, 320, 440, 560, 680].map((x, i) => (
          <div
            key={i}
            className="skeleton rounded-full absolute"
            style={{ left: x, top: "calc(45% - 12px)", width: 24, height: 24 }}
          />
        ))}
        {[160, 260].map((y, i) => (
          <div
            key={`b-${i}`}
            className="skeleton rounded-full absolute"
            style={{ left: "calc(72% - 12px)", top: y, width: 24, height: 24 }}
          />
        ))}
        {[80, 200, 320, 440, 560, 680].map((x, i) => (
          <div
            key={`l-${i}`}
            className="skeleton absolute"
            style={{
              left: x - 10,
              top: "calc(45% - 40px)",
              width: 70,
              height: 10,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function MetroClient({ initialCityId, initialCityData }) {
  const router = useRouter();
  const [recentTracks, setRecentTracks] = useState([]);
  const [selectedCity, setSelectedCity] = useState(
    initialCityData || (initialCityId ? stations[initialCityId] : null),
  );
  const [selectedCityId, setSelectedCityId] = useState(initialCityId || null);
  const [startStation, setStartStation] = useState(null);
  const [endStation, setEndStation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);

  const sendMessage = async (prompt) => {
    setIsLoading(true);
    setMessages([]);

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
            let cleanedContent = content.trim();
            cleanedContent = cleanedContent
              .replace(/^```json?\s*/i, "")
              .replace(/```\s*$/, "");

            const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              content = parsed
                .map((s, i) => `${i + 1}. ${s.title} - ${s.artist}`)
                .join("\n");
            }
          } catch (e) {
            console.error("Failed to parse AI JSON response", e);
            console.error("Raw content:", content);
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

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return "morning";
    if (hour >= 10 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  };

  const handleRecommend = async () => {
    if (!startStation || !endStation) {
      alert("Please select both start and end stations.");
      return;
    }

    if (startStation.name === endStation.name) {
      alert("Start and end stations must be different.");
      return;
    }

    setIsLoading(true);

    const timeOfDay = getTimeOfDay();
    console.log(
      `[handleRecommend] Time of day: ${timeOfDay}, tracks: ${recentTracks.length}`,
    );

    // Fetch mood/genre tags for all tracks
    let tagMap = {};
    try {
      const tracksForTags = recentTracks.map((item) => ({
        artist: item.track.artists[0]?.name || "",
        title: item.track.name,
      }));
      console.log(
        `[handleRecommend] Fetching tags for ${tracksForTags.length} tracks...`,
      );
      const tagsResponse = await fetch("/api/lastfm/track-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracks: tracksForTags }),
      });
      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        tagsData.forEach(({ artist, title, tags }) => {
          tagMap[`${title}|||${artist}`] = tags;
        });
        const taggedCount = Object.values(tagMap).filter(
          (t) => t.length > 0,
        ).length;
        console.log(
          `[handleRecommend] Tags fetched. ${taggedCount}/${tracksForTags.length} tracks have tags`,
        );

        // Log dominant genres/moods
        const allTags = Object.values(tagMap).flat();
        const tagFreq = allTags.reduce((acc, t) => {
          acc[t] = (acc[t] || 0) + 1;
          return acc;
        }, {});
        const topTags = Object.entries(tagFreq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([t]) => t);
        console.log(
          `[handleRecommend] Dominant tags across library: [${topTags.join(", ")}]`,
        );
      } else {
        console.warn(
          "[handleRecommend] Failed to fetch track tags, proceeding without them",
        );
      }
    } catch (err) {
      console.error("[handleRecommend] Error fetching track tags:", err);
    }

    const trackList = recentTracks
      .map((item) => {
        const track = item.track;
        const artists = track.artists.map((a) => a.name).join(", ");
        const totalSeconds = Math.floor(track.duration_ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const key = `${track.name}|||${track.artists[0]?.name || ""}`;
        const tags = tagMap[key] || [];
        const tagStr = tags.length > 0 ? ` [tags: ${tags.join(", ")}]` : "";
        return `- ${track.name} by ${artists} (${minutes} minutes and ${seconds} seconds)${tagStr}`;
      })
      .join("\n");

    let weatherInfo = "";
    if (weatherData && weatherData.length > 0) {
      const weather = weatherData[0];
      if (weather.current) {
        const { temperature, skytext, humidity, winddisplay } = weather.current;
        const locationName = weather.location?.name || selectedCity?.name;
        weatherInfo = `\n\nCurrent weather in ${locationName}: ${temperature}°C, ${skytext}, Humidity: ${humidity}%, Wind: ${winddisplay}`;
      }
    }

    console.log(
      `[handleRecommend] Building prompt for trip: ${selectedCity?.name} — "${startStation.name}" → "${endStation.name}"`,
    );

    const prompt = `Metro trip: ${selectedCity?.name || "Yerevan"}, from "${startStation.name}" to "${endStation.name}".
Time of day: ${timeOfDay} (use this to guide mood — morning: calm/chill, afternoon: neutral, evening: energetic/upbeat, night: mellow/ambient).${weatherInfo}

INSTRUCTIONS:
1. First, search the web for the exact travel time between these two metro stations (riding time only, exclude waiting).
   CRITICAL: Use ONLY metro/subway travel time. DO NOT use bus, tram, walking, taxi, or any other transportation method. ONLY metro/subway.
2. CRITICAL: If the stations are NOT connected via metro (no direct metro route exists), respond with ONLY this JSON array:
   [{"title": "The stations aren't connected via metro", "artist": ""}]
   DO NOT list any further tracks. Stop immediately after returning this response.
3. If stations ARE connected, select tracks from my list below whose TOTAL duration is ≤ the trip duration.
4. CRITICAL: For trips longer than 5 minutes, you MUST recommend at least 2 tracks. For trips longer than 10 minutes, you MUST recommend at least 3 tracks.
5. Prefer multiple shorter tracks over a single long track when possible. Variety is important!
6. Pick from anywhere in the list, not just the top. Mix different songs to create an interesting playlist.
7. ONLY for trips under 3 minutes, a single track is acceptable.
8. NEVER exceed the trip duration, even by a few seconds. Always leave a small buffer.
9. Use the [tags] on each track to match the mood for the time of day and maintain genre continuity between consecutive tracks.

My recent tracks (with mood/genre tags where available):
${trackList}

Respond with a JSON array only: [{"title": "...", "artist": "..."}]`;

    console.log(
      `[handleRecommend] Prompt ready (${prompt.length} chars), sending to AI...`,
    );
    sendMessage(prompt);
  };

  useEffect(() => {
    const selectedContentStr = sessionStorage.getItem("selectedContent");
    if (selectedContentStr) {
      try {
        const selectedContent = JSON.parse(selectedContentStr);
        setRecentTracks(selectedContent.tracks || []);
      } catch (error) {
        console.error("Error parsing selected content:", error);
      }
    } else {
      async function fetchTracks() {
        try {
          const response = await fetch("/api/tracks");
          if (response.ok) {
            const data = await response.json();
            setRecentTracks(data);
          } else {
            console.error("Failed to fetch tracks:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching tracks:", error);
        }
      }
      fetchTracks();
    }
  }, []);

  useEffect(() => {
    if (selectedCity?.name) {
      const WEATHER_CITY = selectedCity.name;
      fetch(
        `https://api.popcat.xyz/v2/weather?q=${encodeURIComponent(WEATHER_CITY)}`,
      )
        .then((res) => res.json())
        .then((json) => {
          const { error, message } = json;
          if (error) {
            console.log(message.error);
            setWeatherData(null);
            return;
          }
          console.log(message);
          setWeatherData(message);
        })
        .catch((err) => {
          console.error("Weather fetch error:", err);
          setWeatherData(null);
        });
    }
  }, [selectedCity]);

  const handleStationClick = (station) => {
    if (startStation && endStation) {
      setStartStation(station);
      setEndStation(null);
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

  const getIsDimmed = (item, isStation = true) => {
    if (!startStation || !endStation) return false;

    const sLine = startStation.lineId;
    const eLine = endStation.lineId;

    if (sLine === eLine) {
      const itemLine = isStation ? item.lineId : item.lineId;
      if (itemLine !== sLine) return true;

      const minX = Math.min(startStation.connector.x, endStation.connector.x);
      const maxX = Math.max(startStation.connector.x, endStation.connector.x);
      const minY = Math.min(startStation.connector.y, endStation.connector.y);
      const maxY = Math.max(startStation.connector.y, endStation.connector.y);

      const itemX = isStation ? item.connector.x : item.x;
      const itemY = isStation ? item.connector.y : item.y;

      // For horizontal lines, only check X
      if (minY === maxY) {
        return itemX < minX || itemX > maxX || itemY !== minY;
      }

      return itemX < minX || itemX > maxX || itemY < minY || itemY > maxY;
    }

    // Different lines: just show the two lines
    const itemLine = isStation ? item.lineId : item.lineId;
    return itemLine !== sLine && itemLine !== eLine;
  };

  const [mapOpen, setMapOpen] = useState(false);
  const mapContentRef = useRef(null);
  return (
    <div className="flex flex-col mt-4 space-y-4 items-center">
      <div className="w-full max-w-5xl">
        <button
          onClick={() => setMapOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <span className="text-white font-semibold">City Selection</span>
          <span className="text-gray-400 text-sm flex items-center gap-2">
            {selectedCity ? (
              <span className="text-blue-400">{selectedCity.name}</span>
            ) : (
              <span>No city selected</span>
            )}
            <span className="ml-1">{mapOpen ? "▲" : "▼"}</span>
          </span>
        </button>
        <div
          style={{
            maxHeight: mapOpen
              ? `${mapContentRef.current?.scrollHeight ?? 480}px`
              : "0px",
            overflow: "hidden",
            transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "max-height",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
          }}
        >
          <div ref={mapContentRef}>
            <div className="mt-2">
              <p className="text-center mb-2 text-gray-400 text-sm">
                Click a city on the map to select it
              </p>
              <CityMap
                selectedCityId={selectedCityId}
                onCitySelect={(cityId) => {
                  setSelectedCityId(cityId);
                  setSelectedCity(stations[cityId]);
                  setStartStation(null);
                  setEndStation(null);
                  setMapOpen(false);
                  setTimeout(() => router.push(`/metro/${cityId}`), 350);
                }}
              />
            </div>
          </div>
        </div>
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

      {!selectedCity && <SkeletonMetroMapInline />}

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
              {Object.entries(selectedCity.stations).map(([stationId, s]) => (
                <Connector
                  key={stationId}
                  size={selectedCity.defaultConnectorSize}
                  {...s.connector}
                  label={s.name}
                  labelBg={null}
                  onClick={() => handleStationClick(s)}
                  isSelected={startStation?.name === s.name}
                  isEndStation={endStation?.name === s.name}
                  dimmed={getIsDimmed(s)}
                />
              ))}
              {selectedCity.extraConnectors?.map((c, i) => (
                <Connector
                  key={`extra-${i}`}
                  size={selectedCity.defaultConnectorSize}
                  {...c}
                  dimmed={getIsDimmed(c, false)}
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
              {isLoading && <SkeletonSongListInline count={4} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
