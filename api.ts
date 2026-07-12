// /home/team/shared/site/api.ts

const PORT = 3001;

// Mock scripts (used when no ANTHROPIC_API_KEY is set)
function generateMockScripts(product: string, audience: string, painPoint: string, tone: string) {
  // Return 3 distinct mock scripts based on the inputs
  return [
    {
      hook: `Stop letting ${painPoint.toLowerCase()} ruin your mornings.`,
      body: `Meet the ${product}. Designed specifically for ${audience.toLowerCase()}. Watch how this simple tool targets the root cause in under 30 seconds. No complicated routines, no expensive treatments. Just results you can see and feel.`,
      cta: `Tap the link in our bio to get yours now with free shipping.`,
      onScreenText: `${painPoint}? → Try this ↓ • 30-second solution • Results in days`,
      audioStyle: "Upbeat lo-fi with a quick tempo drop"
    },
    {
      hook: `I tried everything for ${painPoint.toLowerCase()}... until this.`,
      body: `${audience} — this one's for you. The ${product} is going viral for a reason. Here's the demo: apply, glide, and watch the difference. It targets exactly what's been bothering you. No fillers, no fluff.`,
      cta: `Grab yours at the link below before they sell out!`,
      onScreenText: `How it works ⬇️ • Step 1 • Step 2 • Step 3 • Game changer ✨`,
      audioStyle: "Satisfying ASMR with soft background beat"
    },
    {
      hook: `${audience} - this 30-second hack changed everything.`,
      body: `If you deal with ${painPoint.toLowerCase()}, you NEED the ${product} in your life. Here's why everyone is obsessed: it's simple, it works, and it takes less time than your morning coffee. Watch the full demo.`,
      cta: `Link in bio. Get yours while stock lasts!`,
      onScreenText: `The hack ${audience} needs • ${product} • Try it risk-free`,
      audioStyle: "Dramatic reveal with trending synth build-up"
    }
  ];
}

// Real AI generation (used when ANTHROPIC_API_KEY is set)
async function generateWithAI(product: string, audience: string, painPoint: string, tone: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return generateMockScripts(product, audience, painPoint, tone);
  }

  const prompt = `You are a viral TikTok & Reels scriptwriter. Write 3 unique, ready-to-film video scripts for promoting a product.

Product: ${product}
Target audience: ${audience}
Main pain point: ${painPoint}
Tone: ${tone}

Each script must have a DIFFERENT hook and angle. Return raw JSON array ONLY, no markdown.

Format:
[
  {
    "hook": "Scroll-stopping first 3 seconds",
    "body": "15-30 second demo section",
    "cta": "Strong call to action",
    "onScreenText": "Suggested on-screen captions/overlays",
    "audioStyle": "Recommended trending audio style"
  }
]`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    console.error("Anthropic API error:", await response.text());
    return generateMockScripts(product, audience, painPoint, tone);
  }

  const data = await response.json();
  const text = data.content[0].text;
  
  try {
    // Try to parse JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    let scripts;
    if (jsonMatch) {
      scripts = JSON.parse(jsonMatch[0]);
    } else {
      scripts = JSON.parse(text);
    }

    // Normalize: ensure onScreenText is always a string (not an array)
    return scripts.map((s: any) => ({
      ...s,
      onScreenText: Array.isArray(s.onScreenText) ? s.onScreenText.join(" • ") : s.onScreenText,
      audioStyle: String(s.audioStyle || "")
    }));
  } catch {
    return generateMockScripts(product, audience, painPoint, tone);
  }
}

// Start the server
const server = Bun.serve({
  port: PORT,
  async fetch(request) {
    // CORS — open to all origins (only accessible internally via the proxy)
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers, status: 204 });
    }

    if (request.method !== "POST" || !new URL(request.url).pathname.startsWith("/api/generate")) {
      return new Response(JSON.stringify({ error: "Not found" }), { headers, status: 404 });
    }

    try {
      const body = await request.json();
      const { product, audience, painPoint, tone } = body;

      if (!product || !audience || !painPoint || !tone) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: product, audience, painPoint, tone" }),
          { headers, status: 400 }
        );
      }

      console.log(`Generating scripts for: ${product} (${tone})`);

      const scripts = process.env.ANTHROPIC_API_KEY
        ? await generateWithAI(product, audience, painPoint, tone)
        : generateMockScripts(product, audience, painPoint, tone);

      return new Response(JSON.stringify(scripts), { headers, status: 200 });
    } catch (err) {
      console.error("Error:", err);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { headers, status: 500 }
      );
    }
  }
});

console.log(`🚀 ViralScripts API running on http://0.0.0.0:${PORT}`);