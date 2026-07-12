import { createServerFn } from "@tanstack/react-start";
import type { GenerateRequest, Script } from "~/types";

/**
 * Build a prompt for the AI model to generate 3 TikTok/Reels scripts.
 */
function buildPrompt(input: GenerateRequest): string {
  return `You are a viral short-form video scriptwriter for TikTok and Instagram Reels.

Generate EXACTLY 3 unique, ready-to-film video scripts for promoting a product.
Each script must have a DISTINCT angle/approach — don't rehash the same format.

Product: "${input.product}"
Target Audience: "${input.audience}"
Pain Point Solved: "${input.painPoint}"
Tone: "${input.tone}"

For each script, provide:
1. A scroll-stopping HOOK (first 3 seconds — grabs attention)
2. BODY / DEMO section (shows the product solving the pain point)
3. CTA (call to action — what to do next)
4. On-screen text suggestions (text overlays for the video)
5. Audio style suggestion (music genre / vibe)

Respond ONLY with valid JSON in this exact format — no markdown, no explanation:
{
  "scripts": [
    {
      "hook": "string",
      "body": "string",
      "cta": "string",
      "onScreenText": "string",
      "audioStyle": "string"
    }
  ]
}

Make each script genuinely different in structure and approach. The scripts should feel native to TikTok/Reels — fast-paced, visually driven, and optimized for short attention spans.`;
}

/**
 * Parse AI response JSON, handling potential formatting issues.
 */
function parseScriptsResponse(text: string): { scripts: Script[] } {
  // Try direct parse first
  try {
    const parsed = JSON.parse(text);
    if (parsed.scripts && Array.isArray(parsed.scripts) && parsed.scripts.length === 3) {
      return parsed;
    }
  } catch {
    // Fall through to extraction
  }

  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim());
      if (parsed.scripts && Array.isArray(parsed.scripts)) {
        return parsed;
      }
    } catch {
      // Fall through
    }
  }

  // Last resort: try to find any JSON-like object in the response
  const objectMatch = text.match(/\{[\s\S]*"scripts"[\s\S]*\}/);
  if (objectMatch) {
    try {
      const parsed = JSON.parse(objectMatch[0]);
      if (parsed.scripts && Array.isArray(parsed.scripts)) {
        return parsed;
      }
    } catch {
      // Fall through
    }
  }

  throw new Error("Failed to parse AI response into valid scripts");
}

/**
 * Generate 3 viral scripts using OpenAI's API.
 * Requires OPENAI_API_KEY environment variable.
 */
export const generateScripts = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as GenerateRequest)
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not set. Please add your OpenAI API key to the environment variables."
      );
    }

    const prompt = buildPrompt(data);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a viral short-form video scriptwriter. You ONLY respond with valid JSON. Never wrap JSON in markdown code blocks.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      throw new Error(
        `OpenAI API error (${response.status}): ${errorBody}`
      );
    }

    const result = await response.json();
    const content: string = result.choices?.[0]?.message?.content ?? "";

    if (!content) {
      throw new Error("OpenAI returned an empty response");
    }

    const parsed = parseScriptsResponse(content);
    return parsed.scripts;
  });
