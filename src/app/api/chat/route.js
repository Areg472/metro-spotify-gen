import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";

export async function POST(req) {
  const { prompt } = await req.json();

  const { text } = await generateText({
    model: "openai/gpt-5.2", // Works with any model, not just Perplexity
    prompt,
    tools: {
      perplexity_search: gateway.tools.perplexitySearch(),
    },
    maxSteps: 5,
  });

  return Response.json({ text });
}
