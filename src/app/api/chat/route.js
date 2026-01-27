import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";

export async function POST(req) {
  const { prompt } = await req.json();

  try {
    const result = await generateText({
      model: gateway.model("gpt-4o"),
      prompt,
      tools: {
        perplexity_search: gateway.tools.perplexitySearch(),
      },
      maxSteps: 5,
    });

    console.log("AI Response:", JSON.stringify(result, null, 2));

    return Response.json({ text: result.text });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return Response.json(
      { error: "Failed to generate response", details: error.message },
      { status: 500 },
    );
  }
}
