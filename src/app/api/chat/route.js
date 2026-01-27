import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";

export async function POST(req) {
  const { prompt } = await req.json();

  try {
    const result = await generateText({
      model: "openai/gpt-5.1",
      prompt,
      tools: {
        perplexity_search: gateway.tools.perplexitySearch(),
      },
      maxSteps: 5,
    });

    return Response.json(result);
  } catch (error) {
    console.error("AI Chat Error:", error);
    return Response.json(
      { error: "Failed to generate response", details: error.message },
      { status: 500 },
    );
  }
}
