import { streamText } from "ai";
import { gateway } from "@ai-sdk/gateway";

export async function POST(req) {
  const { messages } = await req.json();

  const result = streamText({
    model: "openai/gpt-5.1",
    messages,
    maxSteps: 5,
    tools: {
      perplexity_search: gateway.tools.perplexitySearch(),
    },
  });

  return result.toDataStreamResponse();
}
