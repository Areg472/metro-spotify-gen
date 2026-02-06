import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request) {
  const { prompt } = await request.json();

  const result = await generateText({
    model: "openai/gpt-5.1",
    system: `You are a metro trip music assistant. 

CRITICAL RULES:
- First use web search to find the EXACT metro travel time between the stations.
- CRITICAL: Use ONLY metro/subway travel time. DO NOT use bus, tram, walking, taxi, or any other transportation method. ONLY metro/subway.
- CRITICAL: If the stations are NOT connected via metro (no direct metro route exists), respond with ONLY this JSON array:
  [{"title": "The stations aren't connected via metro", "artist": ""}]
  DO NOT list any further tracks. Stop immediately after returning this response.
- If stations ARE connected: Select tracks whose TOTAL COMBINED duration is ≤ trip duration. NEVER exceed the trip time.
- CRITICAL: Select a REASONABLE number of tracks. For a 13-minute trip, recommend 3-5 tracks, NOT 40 tracks.
- Prefer multiple shorter tracks over one long track for variety.
- The TOTAL duration of ALL selected tracks combined must NOT exceed the trip duration.
- Always leave a small time buffer (don't use 100% of trip time).

Output ONLY a JSON array: [{"title": "...", "artist": "..."}]`,
    prompt,
    tools: {
      web_search: openai.tools.webSearch({}),
    },
  });

  return Response.json({ text: result.text });
}
