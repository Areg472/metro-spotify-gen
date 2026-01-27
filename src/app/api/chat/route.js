import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request) {
  const { prompt } = await request.json();

  const result = await generateText({
    model: "openai/gpt-5.1",
    system:
      "You are a metro trip music assistant. You must answer in a JSON array containing a list of songs to listen to in order. Each object in the array should have 'title', and 'artist' fields.",
    prompt,
    tools: {
      web_search: openai.tools.webSearch({}),
    },
  });

  return Response.json({ text: result.text });
}
