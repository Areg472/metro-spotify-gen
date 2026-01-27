import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";

export async function POST(request) {
  const { prompt } = await request.json();

  const result = await generateText({
    model: "perplexity/sonar",
    system:
      "You are a metro trip music assistant. You must answer in a JSON array containing a list of songs to listen to in order. Each object in the array should have 'title', and 'artist' fields.",
    prompt,
    tools: {
      perplexity_search: gateway.tools.perplexitySearch(),
    },
  });

  return Response.json({ text: result.text });
}
