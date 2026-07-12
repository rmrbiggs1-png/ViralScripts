// /home/team/shared/site/api.ts
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const PORT = 3001;
const FREE_LIMIT = 3; // Free users get 3 generations per month
const USAGE_FILE = "/home/team/shared/site/.usage.json";

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Get the current calendar month as YYYY-MM string */
function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Run a team-db query and return parsed JSON */
function dbQuery(sql: string): any[] {
  try {
    const result = execSync(`team-db ${JSON.stringify(sql)}`, {
      encoding: "utf8",
      shell: true,
      timeout: 10000,
    });
    return JSON.parse(result.trim());
  } catch (e) {
    console.error("DB query error:", e);
    return [];
  }
}

/** Get or create a usage record for a user from team-db */
function getUserUsage(userId: string): { scripts_generated: number; tier: string } {
  const rows = dbQuery(
    `SELECT scripts_generated, tier FROM usage WHERE user_id = ${JSON.stringify(userId)}`
  );
  if (rows.length > 0) {
    return { scripts_generated: rows[0].scripts_generated, tier: rows[0].tier };
  }
  return { scripts_generated: 0, tier: "free" };
}

/** Increment the user's script count for this month */
function incrementUserUsage(userId: string): void {
  dbQuery(
    `INSERT INTO usage (user_id, scripts_generated, tier) VALUES (${JSON.stringify(userId)}, 1, 'free') ON CONFLICT(user_id) DO UPDATE SET scripts_generated = scripts_generated + 1`
  );
}

/** Update a user's tier */
function setUserTier(userId: string, tier: string): void {
  dbQuery(
    `INSERT INTO usage (user_id, scripts_generated, tier) VALUES (${JSON.stringify(userId)}, 0, ${JSON.stringify(tier)}) ON CONFLICT(user_id) DO UPDATE SET tier = ${JSON.stringify(tier)}`
  );
}

/** Check if a tier qualifies as paid/unlimited */
function isPaidTier(tier: string): boolean {
  return tier === "starter" || tier === "pro";
}

// ── Old IP-based tracking (fallback if no userId provided) ──────────────────

interface UsageRecord {
  generations: number[];
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
  if (!apiKey) return generateMockScripts(product, audience, painPoint, tone);

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
    const scripts = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
    return scripts.map((s: any) => ({
      ...s,
      onScreenText: Array.isArray(s.onScreenText) ? s.onScreenText.join(" • ") : s.onScreenText,
      audioStyle: String(s.audioStyle || "")
    }));
  } catch {
    return generateMockScripts(product, audience, painPoint, tone);
  }
}

// ── CORS base headers ───────────────────────────────────────────────────────

function corsHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Content-Type": "application/json",
    ...extra,
  };
}

// ── Response helpers ────────────────────────────────────────────────────────

function json(data: unknown, status: number = 200, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(data), { headers: corsHeaders(extraHeaders), status });
}

function buildUsageHeaders(used: number, limit: number | null, remaining: number | null): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit ?? "unlimited"),
    "X-RateLimit-Remaining": String(remaining ?? "unlimited"),
    "X-RateLimit-Used": String(used),
    "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000) + 30 * 24 * 60 * 60),
  };
}

// ── Route matcher ───────────────────────────────────────────────────────────

function matchRoute(request: Request): { route: string; method: string } | null {
  const url = new URL(request.url);
  let path = url.pathname;
  // Strip trailing slash
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return { route: path, method: request.method };
}

// ── Server ──────────────────────────────────────────────────────────────────

const server = Bun.serve({
  port: PORT,
  async fetch(request) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(), status: 204 });
    }

    const match = matchRoute(request);
    if (!match) return json({ error: "Not found" }, 404);

    const { route, method } = match;

    try {
      // ── POST /api/generate ─────────────────────────────────────────────
      if (route === "/api/generate" && method === "POST") {
        const body = await request.json();
        const { product, audience, painPoint, tone, userId } = body;

        if (!product || !audience || !painPoint || !tone) {
          return json(
            { error: "Missing required fields: product, audience, painPoint, tone" },
            400
          );
        }

        // ── Usage check via team-db (if userId provided) ──
        if (userId) {
          const usage = getUserUsage(userId);

          // If paid tier, skip limit
          if (!isPaidTier(usage.tier) && usage.scripts_generated >= FREE_LIMIT) {
            return json(
              {
                error: "Free limit reached. Upgrade to continue.",
                upgradeUrl: "https://buy.stripe.com/",
                usage: { used: usage.scripts_generated, limit: FREE_LIMIT, remaining: 0, tier: usage.tier },
              },
              402,
              buildUsageHeaders(usage.scripts_generated, FREE_LIMIT, 0)
            );
          }

          const remaining = isPaidTier(usage.tier)
            ? null
            : Math.max(0, FREE_LIMIT - usage.scripts_generated);

          const responseHeaders = buildUsageHeaders(
            usage.scripts_generated,
            isPaidTier(usage.tier) ? null : FREE_LIMIT,
            remaining
          );

          console.log(
            `Generating scripts for: ${product} (${tone}) — user:${userId} tier:${usage.tier} used:${usage.scripts_generated}/${isPaidTier(usage.tier) ? "∞" : FREE_LIMIT}`
          );

          const scripts = process.env.ANTHROPIC_API_KEY
            ? await generateWithAI(product, audience, painPoint, tone)
            : generateMockScripts(product, audience, painPoint, tone);

          // Increment usage
          incrementUserUsage(userId);

          return json(scripts, 200, responseHeaders);
        }

        // ── Fallback: IP-based tracking (no userId) ──
        const clientKey = `ip:${request.headers.get("x-forwarded-for") || "unknown"}`;
        const usageStore = loadUsage();
        const record = getOrCreateRecord(usageStore, clientKey);
        const used = record.generations.length;

        if (used >= FREE_LIMIT) {
          return json(
            {
              error: "Free limit reached. Sign in to continue.",
              usage: { used, limit: FREE_LIMIT, remaining: 0 },
            },
            402,
            buildUsageHeaders(used, FREE_LIMIT, 0)
          );
        }

        console.log(`Generating scripts for: ${product} (${tone}) — ip-fallback used:${used}/${FREE_LIMIT}`);

        const scripts = process.env.ANTHROPIC_API_KEY
          ? await generateWithAI(product, audience, painPoint, tone)
          : generateMockScripts(product, audience, painPoint, tone);

        record.generations.push(Date.now());
        usageStore[clientKey] = record;
        saveUsage(usageStore);

        return json(scripts, 200, buildUsageHeaders(used + 1, FREE_LIMIT, FREE_LIMIT - used - 1));
      }

      // ── GET /api/upgrade-info ──────────────────────────────────────────
      if (route === "/api/upgrade-info" && method === "GET") {
        return json({
          starter: {
            price: "$19/mo",
            url: "https://buy.stripe.com/3cI9AVfKWfpMgEV2LF5ZC00",
          },
          pro: {
            price: "$49/mo",
            url: "https://buy.stripe.com/aFa5kF8iuelI88p71V5ZC01",
          },
        });
      }

      // ── POST /api/upgrade-user ─────────────────────────────────────────
      if (route === "/api/upgrade-user" && method === "POST") {
        const body = await request.json();
        const { userId, tier } = body;

        if (!userId || !tier) {
          return json({ error: "Missing required fields: userId, tier" }, 400);
        }

        if (!["free", "starter", "pro"].includes(tier)) {
          return json({ error: "Invalid tier. Must be: free, starter, or pro" }, 400);
        }

        setUserTier(userId, tier);
        console.log(`Upgraded user ${userId} to ${tier}`);

        return json({ success: true, userId, tier });
      }

      // ── POST /api/waitlist ────────────────────────────────────────────
      if (route === "/api/waitlist" && method === "POST") {
        const body = await request.json();
        const { email, name } = body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return json({ error: "Valid email is required" }, 400);
        }

        const existing = dbQuery(
          `SELECT email FROM waitlist WHERE email = ${JSON.stringify(email)}`
        );

        if (existing.length > 0) {
          return json({ success: true, message: "You're on the list!" }, 200);
        }

        dbQuery(
          `INSERT INTO waitlist (email, name) VALUES (${JSON.stringify(email)}, ${JSON.stringify(name || "")})`
        );

        console.log(`📋 Waitlist signup: ${email}`);
        return json({ success: true, message: "You're on the list!" }, 201);
      }

      // ── POST /api/track ───────────────────────────────────────────────
      if (route === "/api/track" && method === "POST") {
        const body = await request.json();
        const { event, userId, metadata } = body;

        if (!event) {
          return json({ error: "event is required" }, 400);
        }

        const validEvents = ["page_view", "sign_up", "generation", "upgrade_click"];
        if (!validEvents.includes(event)) {
          return json({ error: `Invalid event. Must be one of: ${validEvents.join(", ")}` }, 400);
        }

        dbQuery(
          `INSERT INTO analytics_v2 (event, user_id, metadata) VALUES (${JSON.stringify(event)}, ${JSON.stringify(userId || "")}, ${JSON.stringify(metadata ? JSON.stringify(metadata) : "")})`
        );

        console.log(`📊 Track event: ${event}${userId ? ` (user:${userId})` : ""}`);
        return json({ success: true }, 201);
      }

      // ── GET /api/stats ─────────────────────────────────────────────────
      if (route === "/api/stats" && method === "GET") {
        const totalGenerations = dbQuery(
          `SELECT COUNT(*) as count FROM analytics_v2 WHERE event = 'generation'`
        );
        const totalUsers = dbQuery(
          `SELECT COUNT(DISTINCT user_id) as count FROM analytics_v2 WHERE user_id != ''`
        );
        const totalWaitlist = dbQuery(
          `SELECT COUNT(*) as count FROM waitlist`
        );

        return json({
          totalGenerations: totalGenerations[0]?.count ?? 0,
          totalUsers: totalUsers[0]?.count ?? 0,
          totalWaitlist: totalWaitlist[0]?.count ?? 0,
        });
      }

      // ── POST /api/analytics/track (legacy) ─────────────────────────────
      if (route === "/api/analytics/track" && method === "POST") {
        const body = await request.json();
        const { eventType, product, audience, painPoint, tone, userId } = body;

        if (!eventType) {
          return json({ error: "eventType is required" }, 400);
        }

        dbQuery(
          `INSERT INTO analytics (event_type, product, audience, pain_point, tone, user_id) VALUES (${JSON.stringify(eventType)}, ${JSON.stringify(product || "")}, ${JSON.stringify(audience || "")}, ${JSON.stringify(painPoint || "")}, ${JSON.stringify(tone || "")}, ${JSON.stringify(userId || "")})`
        );

        return json({ success: true }, 201);
      }

      // ── GET /api/analytics/summary ───────────────────────────────────
      if (route === "/api/analytics/summary" && method === "GET") {
        const totalGenerations = dbQuery(
          `SELECT COUNT(*) as count FROM analytics WHERE event_type = 'generate'`
        );

        const topProducts = dbQuery(
          `SELECT product, COUNT(*) as count FROM analytics WHERE event_type = 'generate' AND product != '' GROUP BY product ORDER BY count DESC LIMIT 10`
        );

        const topTones = dbQuery(
          `SELECT tone, COUNT(*) as count FROM analytics WHERE event_type = 'generate' AND tone != '' GROUP BY tone ORDER BY count DESC LIMIT 10`
        );

        const totalWaitlist = dbQuery(
          `SELECT COUNT(*) as count FROM waitlist`
        );

        const todaysGenerations = dbQuery(
          `SELECT COUNT(*) as count FROM analytics WHERE event_type = 'generate' AND created_at >= datetime('now', '-1 day')`
        );

        return json({
          totalGenerations: totalGenerations[0]?.count ?? 0,
          todaysGenerations: todaysGenerations[0]?.count ?? 0,
          totalWaitlistSignups: totalWaitlist[0]?.count ?? 0,
          topProducts,
          topTones,
        });
      }

      // ── Not found ──────────────────────────────────────────────────────
      return json({ error: "Not found" }, 404);
    } catch (err) {
      console.error("Error:", err);
      return json({ error: "Internal server error" }, 500);
    }
  }
});

console.log(`🚀 ViralScripts API running on http://0.0.0.0:${PORT}`);
console.log(`📊 Free tier limit: ${FREE_LIMIT} generations/month per user`);
console.log(`💳 Upgrade info at GET /api/upgrade-info`);
console.log(`👤 Upgrade user at POST /api/upgrade-user`);
console.log(`📋 Waitlist signup at POST /api/waitlist`);
console.log(`📊 Analytics track at POST /api/analytics/track`);
console.log(`📈 Analytics summary at GET /api/analytics/summary`);
console.log(`📦 DB-backed usage tracking via team-db`);