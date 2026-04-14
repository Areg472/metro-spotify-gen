import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request) {
  const { prompt } = await request.json();

  console.log("[chat] Received prompt, sending to AI...");

  const result = await generateText({
    model: "anthropic/claude-haiku-4.5",
    system: `You are a metro trip music assistant. 

CRITICAL RULES:
- First use web search to find the EXACT metro travel time between the stations.
- CRITICAL: Use ONLY metro/subway travel time. DO NOT use bus, tram, walking, taxi, or any other transportation method. ONLY metro/subway.
- CRITICAL: If the stations are NOT connected via metro (no direct metro route exists), respond with ONLY this JSON:
  {"travelTimeMinutes": 0, "tracks": [{"title": "The stations aren't connected via metro", "artist": "", "durationSeconds": 0}]}
  DO NOT list any further tracks. Stop immediately after returning this response.
- If stations ARE connected: Select tracks whose TOTAL COMBINED duration is ≤ trip duration. NEVER exceed the trip time.
- CRITICAL: Select a REASONABLE number of tracks. For a 13-minute trip, recommend 3-5 tracks, NOT 40 tracks.
- Prefer multiple shorter tracks over one long track for variety.
- The TOTAL duration of ALL selected tracks combined must NOT exceed the trip duration.
- Always leave a small time buffer (don't use 100% of trip time).

MOOD & GENRE RULES (if mood/genre/tag data is provided in the prompt):
- Match the overall mood of the playlist to the time of day: morning → calm/chill/acoustic; evening rush → energetic/upbeat; night → mellow/ambient.
- Maintain GENRE CONTINUITY: avoid jarring genre switches between consecutive tracks. Prefer tracks that share at least one genre or mood tag with the previous track.
- If a dominant genre/mood is present in the track list, lean towards it for the playlist.
- Use the tags provided per track to inform your selection. Tags may include genres (e.g. "rock", "jazz"), moods (e.g. "chill", "energetic"), or descriptors (e.g. "rainy day", "workout").

Output ONLY a JSON object with this exact format: {"travelTimeMinutes": <number>, "tracks": [{"title": "...", "artist": "..."}]}
The travelTimeMinutes should be the estimated metro travel time in minutes. Do NOT include durationSeconds in your output — durations are provided in the prompt for your reference only, so you can respect the time constraint. They will be added separately.`,
    prompt,
    tools: {
      web_search: openai.tools.webSearch({}),
    },
  });

  console.log("[chat] AI response received, length:", result.text?.length ?? 0);

  return Response.json({ text: result.text });
}
