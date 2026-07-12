// /home/team/shared/site/api.ts
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const PORT = 3001;
const FREE_LIMIT = 3; // Free users get 3 generations per month
const USAGE_FILE = "/home/team/shared/site/.usage.json";

// ── Usage Tracking ──────────────────────────────────────────────────────────

interface UsageRecord {
  /** Timestamps (ms) of each generation request this month window */
  generations: number[];
  /** When the current month window started */
  windowStart: number;
}

type UsageStore = Record<string, UsageRecord>;

function loadUsage(): UsageStore {
  try {
    if (!existsSync(USAGE_FILE)) return {};
    const raw = readFileSync(USAGE_FILE, "utf8");
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

function saveUsage(store: UsageStore): void {
  try {
    writeFileSync(USAGE_FILE, JSON.stringify(store, null, 2));
  } catch (e) {
    console.error("Failed to save usage data:", e);
  }
}

/**
 * Get or create a usage record for the given client key (IP or user ID).
 * Resets the window if it's been more than 30 days since windowStart.
 */
function getOrCreateRecord(store: UsageStore, clientKey: string): UsageRecord {
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  let record = store[clientKey];

  if (!record || now - record.windowStart > THIRTY_DAYS) {
    record = { generations: [], windowStart: now };
    store[clientKey] = record;
  }

  return record;
}

/**
 * Check if a request is from a paid user.
 * Paid users are identified by sending an x-api-key header matching
 * a key listed in the VIRALSCRIPTS_PAID_KEYS env var (comma-separated).
 */
function isPaidRequest(request: Request): boolean {
  const paidKeys = process.env.VIRALSCRIPTS_PAID_KEYS || "";
  if (!paidKeys) return false;
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) return false;
  return paidKeys.split(",").map((k) => k.trim()).includes(apiKey);
}

/**
 * Get the client identifier for usage tracking.
 * Uses x-forwarded-for (proxied) or the direct connection remote address.
 */
function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  // Fall back to a hash of the connection info
  return `ip:${request.headers.get("cf-connecting-ip") || "unknown"}`;
}

// ── Mock Scripts ────────────────────────────────────────────────────────────

function generateMockScripts(product: string, audience: string, painPoint: string, tone: string) {
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

// ── AI Generation (Anthropic) ───────────────────────────────────────────────

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
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    let scripts;
    if (jsonMatch) {
      scripts = JSON.parse(jsonMatch[0]);
    } else {
      scripts = JSON.parse(text);
    }

    return scripts.map((s: any) => ({
      ...s,
      onScreenText: Array.isArray(s.onScreenText) ? s.onScreenText.join(" • ") : s.onScreenText,
      audioStyle: String(s.audioStyle || "")
    }));
  } catch {
    return generateMockScripts(product, audience, painPoint, tone);
  }
}

// ── Usage Response Helpers ──────────────────────────────────────────────────

function buildUsageHeaders(
  used: number,
  limit: number | null,
  remaining: number | null
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit ?? "unlimited"),
    "X-RateLimit-Remaining": String(remaining ?? "unlimited"),
    "X-RateLimit-Used": String(used),
    "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000) + 30 * 24 * 60 * 60),
  };
}

// ── Server ──────────────────────────────────────────────────────────────────

const server = Bun.serve({
  port: PORT,
  async fetch(request) {
    // CORS — open to all origins
    const headers: Record<string, string> = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
      "Content-Type": "application/json",
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

      const paid = isPaidRequest(request);
      const clientKey = getClientKey(request);
      const usageStore = loadUsage();
      const record = getOrCreateRecord(usageStore, clientKey);

      const used = record.generations.length;
      const limit = paid ? null : FREE_LIMIT;
      const remaining = paid ? null : Math.max(0, FREE_LIMIT - used);

      // Merge usage headers into response headers
      const responseHeaders = { ...headers, ...buildUsageHeaders(used, limit, remaining) };

      // Enforce free tier limit
      if (!paid && used >= FREE_LIMIT) {
        return new Response(
          JSON.stringify({
            error: "Free tier limit reached",
            message: `You've used all ${FREE_LIMIT} free generations this month. Upgrade to Pro for unlimited script generation.`,
            usage: { used, limit: FREE_LIMIT, remaining: 0 },
          }),
          { headers: responseHeaders, status: 429 }
        );
      }

      console.log(
        `Generating scripts for: ${product} (${tone}) — ` +
        `client:${clientKey.slice(0, 20)} paid:${paid} used:${used}/${limit ?? "∞"}`
      );

      const scripts = process.env.ANTHROPIC_API_KEY
        ? await generateWithAI(product, audience, painPoint, tone)
        : generateMockScripts(product, audience, painPoint, tone);

      // Record the generation
      record.generations.push(Date.now());
      usageStore[clientKey] = record;
      saveUsage(usageStore);

      return new Response(JSON.stringify(scripts), { headers: responseHeaders, status: 200 });
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
console.log(`📊 Free tier limit: ${FREE_LIMIT} generations/month per client`);
console.log(`🔑 Paid tier: enabled via VIRALSCRIPTS_PAID_KEYS env var`);