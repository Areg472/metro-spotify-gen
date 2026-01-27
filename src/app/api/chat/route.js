import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";

export async function POST(request) {
  const { prompt } = await request.json();

  const { text } = await generateText({
    model: "openai/gpt-5.1",
    prompt,
    tools: {
      perplexity_search: gateway.tools.perplexitySearch(),
    },
  });

  return Response.json({ text });
}
