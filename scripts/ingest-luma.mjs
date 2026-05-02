#!/usr/bin/env node
// Ingest Lu.ma city discovery pages (Bengaluru, Hyderabad, etc.) into the events table.
// Usage: node scripts/ingest-luma.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadDotEnv(path) {
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {}
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
loadDotEnv(join(projectRoot, ".env.local"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

// Lu.ma city slugs we care about. Discover slug might differ from display name
// (e.g. "bengaluru" not "bangalore") — verified via lu.ma/discover.
const CITIES = [
  { slug: "bengaluru", label: "Bengaluru" },
  { slug: "mumbai", label: "Mumbai" },
  { slug: "delhi", label: "Delhi" },
  { slug: "hyderabad", label: "Hyderabad" },
  { slug: "pune", label: "Pune" },
  { slug: "chennai", label: "Chennai" },
];

// Heuristic topic tagging from the event title + calendar name.
// Intentionally rough — moderators can refine on /admin later.
const TOPIC_RULES = [
  { topic: "ai", match: /\b(ai|ml|llm|gpt|agent|genai|chatbot|ml ?ops)\b/i },
  { topic: "web3", match: /\b(web3|crypto|blockchain|defi|nft|ethereum|solana)\b/i },
  { topic: "startup", match: /\b(startup|founder|vc|funding|pitch|yc|y combinator)\b/i },
  { topic: "design", match: /\b(design|figma|ux|ui)\b/i },
  { topic: "product", match: /\b(product|pm |prd )\b/i },
  { topic: "devops", match: /\b(devops|kubernetes|k8s|docker|sre)\b/i },
  { topic: "data", match: /\b(data|analytics|postgres|warehouse|duckdb)\b/i },
  { topic: "fintech", match: /\b(fintech|finance|bank|payment)\b/i },
  { topic: "security", match: /\b(security|infosec|cyber|pentest)\b/i },
  { topic: "web-dev", match: /\b(react|next\.?js|frontend|fullstack|web ?dev)\b/i },
  { topic: "mobile", match: /\b(android|ios|swift|flutter|mobile)\b/i },
  { topic: "open-source", match: /\b(open ?source|oss|kubernetes|linux)\b/i },
  { topic: "hackathon", match: /\bhackathon\b/i },
];

function inferTopics(text) {
  const topics = new Set();
  for (const { topic, match } of TOPIC_RULES) {
    if (match.test(text)) topics.add(topic);
  }
  return [...topics];
}

function inferVibeTags(text) {
  const t = text.toLowerCase();
  const tags = [];
  if (/(meetup|mixer|social|drinks|dinner|afterparty|after-party|happy hour)/.test(t))
    tags.push("social-mixer", "networking-heavy", "chill");
  if (/(workshop|hands-on|build|code along|sprint)/.test(t))
    tags.push("workshop", "hands-on");
  if (/(talk|panel|fireside|keynote|lecture)/.test(t)) tags.push("talks-only");
  if (/(hackathon|competition|contest|prize)/.test(t))
    tags.push("competitive", "high-energy");
  // Default to "chill" for small meetups if no other vibe matched
  if (tags.length === 0) tags.push("networking-heavy", "chill");
  return [...new Set(tags)].slice(0, 4);
}

async function fetchCity(slug) {
  const res = await fetch(`https://lu.ma/${slug}`, {
    redirect: "follow",
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; goirl-ingest/1.0; +https://goirl.in)",
    },
  });
  if (!res.ok) {
    console.warn(`  ! ${slug}: HTTP ${res.status}`);
    return [];
  }
  const html = await res.text();
  const m = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!m) {
    console.warn(`  ! ${slug}: no __NEXT_DATA__`);
    return [];
  }
  const data = JSON.parse(m[1]);
  const events = data?.props?.pageProps?.initialData?.data?.events ?? [];
  return events;
}

// Map Lu.ma's granular city names to the 6 canonical cities the UI
// filters expose. "New Delhi", "Gurugram", "Noida" all roll up to "Delhi".
const CITY_ALIASES = {
  "new delhi": "Delhi",
  gurgaon: "Delhi",
  gurugram: "Delhi",
  noida: "Delhi",
  faridabad: "Delhi",
  ghaziabad: "Delhi",
  "navi mumbai": "Mumbai",
  thane: "Mumbai",
  bangalore: "Bengaluru",
  bengaluru: "Bengaluru",
  mumbai: "Mumbai",
  delhi: "Delhi",
  hyderabad: "Hyderabad",
  pune: "Pune",
  chennai: "Chennai",
};

function normalizeCity(city, fallback) {
  const key = (city ?? "").trim().toLowerCase();
  if (key && CITY_ALIASES[key]) return CITY_ALIASES[key];
  return city ?? fallback;
}

function mapRow(raw, fallbackCity) {
  const e = raw.event;
  const geo = e.geo_address_info ?? {};
  const city = normalizeCity(geo.city, fallbackCity);
  const isVirtual = e.location_type !== "offline";
  const host = (raw.hosts ?? [])[0];
  const organizer =
    host?.name ??
    host?.display_name ??
    raw.calendar?.name ??
    "Lu.ma host";
  const ticket = raw.ticket_info ?? {};
  const isFree = !!ticket.is_free || ticket.price == null;
  const text = `${e.name} ${raw.calendar?.name ?? ""}`;
  const topics = inferTopics(text);
  const vibeTags = inferVibeTags(text);

  return {
    id: `luma-${e.api_id}`,
    title: e.name.trim(),
    description: `${e.name.trim()} via ${organizer}${
      city ? ` in ${city}` : ""
    }. ${raw.guest_count ? `${raw.guest_count} people registered so far. ` : ""}RSVP on Lu.ma for full details, venue, and timing.`.trim(),
    starts_at: e.start_at,
    ends_at: e.end_at,
    timezone: e.timezone ?? "Asia/Kolkata",
    city,
    country: geo.country_code ?? "IN",
    is_virtual: isVirtual,
    register_url: `https://luma.com/${e.url}`,
    organizer,
    source: "luma",
    source_id: e.api_id,
    topics,
    cover_image: e.cover_url ?? null,
    price: isFree ? 0 : ticket.price ?? null,
    is_free: isFree,
    tags: null,
    difficulty: null,
    why_attend: null,
    perks: null,
    interested_count: raw.guest_count ?? 0,
    vibe_tags: vibeTags,
    audience: ["early-devs", "senior-devs", "founders", "everyone"],
    is_beginner_friendly: false,
    comfort_note:
      vibeTags.includes("social-mixer") || vibeTags.includes("networking-heavy")
        ? "Open meetup vibe — come alone, you'll find your people."
        : null,
    is_featured: false,
    lat: e.coordinate?.latitude ?? null,
    lng: e.coordinate?.longitude ?? null,
    venue: geo.address ?? null,
    status: "published",
  };
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let totalFetched = 0;
const byId = new Map();

for (const { slug, label } of CITIES) {
  console.log(`Fetching lu.ma/${slug}…`);
  const events = await fetchCity(slug);
  totalFetched += events.length;
  for (const raw of events) {
    if (!raw.event?.api_id) continue;
    const row = mapRow(raw, label);
    byId.set(row.id, row); // dedupe across cities
  }
}

const rows = [...byId.values()];
console.log(
  `Fetched ${totalFetched} event refs; deduped to ${rows.length} unique.`,
);

if (rows.length === 0) {
  console.log("Nothing to upsert.");
  process.exit(0);
}

const { error, count } = await admin
  .from("events")
  .upsert(rows, { onConflict: "source,source_id", count: "exact" });

if (error) {
  console.error("Upsert failed:", error);
  process.exit(1);
}

console.log(`✓ Upserted ${count ?? rows.length} Lu.ma events`);
const byCity = rows.reduce((acc, r) => {
  acc[r.city ?? "?"] = (acc[r.city ?? "?"] ?? 0) + 1;
  return acc;
}, {});
console.log("  by city:", byCity);
