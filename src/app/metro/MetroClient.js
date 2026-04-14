"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { stations } from "@/data/stations";
import { Connector } from "@/metroui/Connector";
import { findHighlightPath } from "@/data/stations/pathfinding";
import { TrainAnimation } from "@/metroui/TrainAnimation";
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
  const [confirmHasFiles, setConfirmHasFiles] = useState(false);
  const [showExportCheckbox, setShowExportCheckbox] = useState(false);
  const [trainAnimationKey, setTrainAnimationKey] = useState(0);
  const [travelTimeMinutes, setTravelTimeMinutes] = useState(null);
  const [visibleTrackCount, setVisibleTrackCount] = useState(0);
  const [playlistRevealing, setPlaylistRevealing] = useState(false);

  const sendMessage = async (prompt) => {
    setIsLoading(true);
    setMessages([]);
    setTravelTimeMinutes(null);
    setVisibleTrackCount(0);
    setPlaylistRevealing(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("AI Response:", data);

        let content = data.text || "No response from AI.";
        let parsedTracks = null;
        let parsedTravelTime = null;

        try {
          let cleanedContent = content.trim();
          cleanedContent = cleanedContent
            .replace(/^```json?\s*/i, "")
            .replace(/```\s*$/, "");

          // Try parsing as object with travelTimeMinutes and tracks
          const objMatch = cleanedContent.match(/\{[\s\S]*\}/);
          if (objMatch) {
            const parsed = JSON.parse(objMatch[0]);
            if (parsed.tracks && Array.isArray(parsed.tracks)) {
              parsedTravelTime = parsed.travelTimeMinutes || null;
              parsedTracks = parsed.tracks.map((s) => ({
                title: s.title,
                artist: s.artist,
                durationSeconds: s.durationSeconds || 0,
              }));
            } else if (Array.isArray(parsed)) {
              // Fallback: plain array
              parsedTracks = parsed.map((s) => ({
                title: s.title,
                artist: s.artist,
                durationSeconds: s.durationSeconds || 0,
              }));
            }
          }

          // Fallback: try plain array
          if (!parsedTracks) {
            const arrMatch = cleanedContent.match(/\[[\s\S]*\]/);
            if (arrMatch) {
              const parsed = JSON.parse(arrMatch[0]);
              parsedTracks = parsed.map((s) => ({
                title: s.title,
                artist: s.artist,
                durationSeconds: s.durationSeconds || 0,
              }));
            }
          }
        } catch (e) {
          console.error("Failed to parse AI JSON response", e);
          console.error("Raw content:", content);
        }

        if (parsedTracks) {
          // Fetch real durations from Last.fm
          try {
            const durationsResponse = await fetch(
              "/api/lastfm/track-durations",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  tracks: parsedTracks.map((t) => ({
                    artist: t.artist,
                    title: t.title,
                  })),
                }),
              },
            );
            if (durationsResponse.ok) {
              const durations = await durationsResponse.json();
              parsedTracks = parsedTracks.map((track, i) => ({
                ...track,
                durationSeconds:
                  durations[i]?.durationSeconds || track.durationSeconds,
              }));
            }
          } catch (err) {
            console.error("Failed to fetch track durations from Last.fm:", err);
          }

          content = parsedTracks;
          if (parsedTravelTime) {
            setTravelTimeMinutes(parsedTravelTime);
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
    setTrainAnimationKey((k) => k + 1);

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

    // Shuffle tracks randomly before sending to AI for more variety
    const shuffledTracks = [...recentTracks].sort(() => Math.random() - 0.5);

    const trackList = shuffledTracks
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
1. The estimated metro travel time for this trip is approximately ${highlightPath?.estimatedMinutes ? Math.round(highlightPath.estimatedMinutes) : "unknown"} minutes (${highlightPath?.pathStationKeys ? highlightPath.pathStationKeys.length - 1 : "?"} stations, ~2.5 min per station + 3 min per transfer).
   Use this estimate as the target duration. If it seems unreasonable, you may adjust slightly based on your knowledge.
2. CRITICAL: If the stations are NOT connected via metro (no direct metro route exists), respond with ONLY this JSON:
   {"travelTimeMinutes": 0, "tracks": [{"title": "The stations aren't connected via metro", "artist": "", "durationSeconds": 0}]}
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

Respond with a JSON object only: {"travelTimeMinutes": <number>, "tracks": [{"title": "...", "artist": "...", "durationSeconds": <number>}]}`;

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

  const highlightPath = useMemo(() => {
    if (!selectedCity || !startStation || !endStation) return null;
    return findHighlightPath(selectedCity, startStation, endStation);
  }, [selectedCity, startStation, endStation]);

  const getIsDimmed = (key) => {
    if (!startStation || !endStation) return false;
    if (!highlightPath) return false;
    return !highlightPath.pathKeys.has(key);
  };

  const getActiveLegs = (key) => {
    if (!highlightPath) return null;
    return highlightPath.activeLegs.get(key);
  };

  // When messages arrive with tracks, replay train animation and start playlist reveal
  // Only do the animated reveal when both stations are on a single line
  useEffect(() => {
    const trackMessage = messages.find(
      (m) =>
        Array.isArray(m.content) &&
        m.content.length > 0 &&
        m.content[0].title !== "The stations aren't connected via metro",
    );
    if (!trackMessage) return;

    // Skip animated reveal if the route spans multiple lines
    if (!highlightPath?.isSingleLine) {
      setVisibleTrackCount(trackMessage.content.length);
      setPlaylistRevealing(false);
      return;
    }

    const tracks = trackMessage.content;
    setVisibleTrackCount(0);
    setPlaylistRevealing(true);

    // Replay train animation
    setTrainAnimationKey((k) => k + 1);

    // Match reveal duration to the train animation duration so they finish together
    // TrainAnimation uses: Math.max(2000, pathCoords.length * 800)
    const pathLength = highlightPath?.pathCoords?.length || 2;
    const trainAnimDurationMs = Math.max(2000, pathLength * 800);

    const totalTrackDuration = tracks.reduce(
      (sum, t) => sum + (t.durationSeconds || 0),
      0,
    );
    // Use the train animation duration as the reveal window
    const revealDurationMs = trainAnimDurationMs;

    let cumulativeDelay = 0;
    const timeouts = [];

    tracks.forEach((track, i) => {
      // Proportional delay based on song duration relative to total
      const proportion =
        totalTrackDuration > 0
          ? (track.durationSeconds || 0) / totalTrackDuration
          : 1 / tracks.length;
      const delay = i === 0 ? 600 : proportion * revealDurationMs;
      cumulativeDelay += delay;

      const t = setTimeout(() => {
        setVisibleTrackCount(i + 1);
      }, cumulativeDelay);
      timeouts.push(t);
    });

    // Mark reveal complete
    const finalTimeout = setTimeout(() => {
      setPlaylistRevealing(false);
    }, cumulativeDelay + 500);
    timeouts.push(finalTimeout);

    return () => timeouts.forEach(clearTimeout);
  }, [messages, travelTimeMinutes, highlightPath]);

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
              {trainAnimationKey > 0 &&
                highlightPath?.isSingleLine &&
                highlightPath?.pathCoords && (
                  <TrainAnimation
                    key={trainAnimationKey}
                    pathCoords={highlightPath.pathCoords}
                    connectorSize={selectedCity.defaultConnectorSize}
                    color={Array.from(highlightPath.pathLineIds)[0]}
                  />
                )}
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
                  dimmed={getIsDimmed(stationId)}
                  activeLegs={getActiveLegs(stationId)}
                />
              ))}
              {selectedCity.extraConnectors?.map((c, i) => (
                <Connector
                  key={`extra-${i}`}
                  size={selectedCity.defaultConnectorSize}
                  {...c}
                  dimmed={getIsDimmed(`extra-${i}`)}
                  activeLegs={getActiveLegs(`extra-${i}`)}
                />
              ))}
            </div>
          </div>

          <div className="mt-8 w-full border-t border-gray-700 pt-6">
            <div className="flex flex-col space-y-2">
              {messages.map((m) => (
                <div key={m.id} className="text-white">
                  {Array.isArray(m.content) ? (
                    <ol className="list-none space-y-2 pl-0">
                      {m.content.map((track, i) => {
                        const isVisible =
                          !playlistRevealing || i < visibleTrackCount;
                        return (
                          <li
                            key={i}
                            className="flex items-center gap-3 py-1"
                            style={{
                              opacity: isVisible ? 1 : 0,
                              transform: isVisible
                                ? "translateY(0)"
                                : "translateY(12px)",
                              transition:
                                "opacity 0.5s ease, transform 0.5s ease",
                            }}
                          >
                            <span className="flex-shrink-0 w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center">
                              {i + 1}
                            </span>
                            <a
                              href={`https://www.last.fm/music/${encodeURIComponent(track.artist)}/_/${encodeURIComponent(track.title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              {track.title} — {track.artist}
                            </a>
                            {track.durationSeconds > 0 && (
                              <span className="text-gray-500 text-xs ml-2">
                                {Math.floor(track.durationSeconds / 60)}:
                                {String(track.durationSeconds % 60).padStart(
                                  2,
                                  "0",
                                )}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  )}
                </div>
              ))}
              {isLoading && <SkeletonSongListInline count={4} />}
              {messages.some(
                (m) =>
                  Array.isArray(m.content) &&
                  m.content.length > 0 &&
                  m.content[0].title !==
                    "The stations aren't connected via metro",
              ) && (
                <div className="mt-4 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (!showExportCheckbox) {
                        setShowExportCheckbox(true);
                        return;
                      }
                      if (confirmHasFiles) {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.multiple = true;
                        input.accept = "audio/*";
                        input.onchange = () => {
                          const selectedFiles = Array.from(input.files);
                          const musicFiles = selectedFiles.map((f) => f.name);
                          const tracks = messages
                            .filter((m) => Array.isArray(m.content))
                            .flatMap((m) => m.content);
                          let m3u = `#EXTM3U\n#PLAYLIST:Metro Playlist [${selectedCity?.name || "Unknown"}]\n`;
                          let matchedCount = 0;
                          tracks.forEach((track) => {
                            const titleLower = track.title.toLowerCase();
                            const matched = musicFiles.find((f) =>
                              f.toLowerCase().includes(titleLower),
                            );
                            if (matched) {
                              matchedCount++;
                              m3u += `#EXTINF:-1,${track.artist} - ${track.title}\n`;
                              m3u += `${matched}\n`;
                            }
                          });
                          if (matchedCount === 0) {
                            alert(
                              "No matching files found in the selected folder for any of the tracks.",
                            );
                            return;
                          }
                          const blob = new Blob([m3u], {
                            type: "audio/x-mpegurl",
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `Metro Playlist [${selectedCity?.name || "Unknown"}].m3u`;
                          a.click();
                          URL.revokeObjectURL(url);
                        };
                        input.click();
                      }
                    }}
                    className="w-fit px-5 py-2 bg-blue-600 text-white rounded-lg font-bold cursor-pointer hover:bg-blue-700"
                  >
                    Export as M3U Playlist
                  </button>
                  {showExportCheckbox && (
                    <label className="flex items-center gap-2 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmHasFiles}
                        onChange={(e) => setConfirmHasFiles(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm">
                        I confirm that I have the audio files for these songs
                        and will upload them by clicking the button above
                      </span>
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
