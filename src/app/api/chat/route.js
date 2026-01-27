import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";

export async function POST(request) {
  const { prompt } = await request.json();

  const result = await generateText({
    model: "perplexity/sonar",
    prompt,
    tools: {
      perplexity_search: gateway.tools.perplexitySearch(),
    },
  });

  return Response.json({ text: result.text });
}
