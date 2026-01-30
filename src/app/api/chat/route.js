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
- The total duration of selected tracks MUST be ≤ trip duration. NEVER exceed it.
- For short trips (under 3 minutes), recommend only 1 track.
- For trips 3-6 minutes, recommend 1-2 tracks max.

Output ONLY a JSON array: [{"title": "...", "artist": "..."}]`,
    prompt,
    tools: {
      web_search: openai.tools.webSearch({}),
    },
  });

  return Response.json({ text: result.text });
}
