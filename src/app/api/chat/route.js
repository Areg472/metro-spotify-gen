import { streamText } from "ai";
import { gateway } from "@ai-sdk/gateway";

export async function POST(request) {
  const { prompt } = await request.json();

  const result = streamText({
    model: "openai/gpt-5.1",
    prompt,
    tools: {
      perplexity_search: gateway.tools.perplexitySearch(),
    },
  });

  for await (const part of result.fullStream) {
    if (part.type === "text-delta") {
      process.stdout.write(part.text);
    } else if (part.type === "tool-call") {
      console.log("Tool call:", part.toolName);
    } else if (part.type === "tool-result") {
      console.log("Search results received");
    }
  }

  return result.toDataStreamResponse();
}
