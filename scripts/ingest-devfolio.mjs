#!/usr/bin/env node
// Ingest Devfolio hackathons (India, in-person or online) into the events table.
// Listing lives at https://devfolio.co/hackathons (SSG), per-hackathon details
// at https://<slug>.devfolio.co — both Next.js, both expose __NEXT_DATA__.

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

const UA = "Mozilla/5.0 (compatible; goirl-ingest/1.0; +https://goirl.in)";

function extractNextData(html) {
  const m = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

async function fetchListing() {
  const res = await fetch("https://devfolio.co/hackathons", {
    headers: { "user-agent": UA },
  });
  if (!res.ok) throw new Error(`listing HTTP ${res.status}`);
  const data = extractNextData(await res.text());
  const d = data?.props?.pageProps?.dehydratedState?.queries?.[0]?.state?.data;
  if (!d) throw new Error("no hackathons data in listing");
  return [
    ...(d.featured_hackathons ?? []),
    ...(d.open_hackathons ?? []),
    ...(d.upcoming_hackathons ?? []),
  ];
}

async function fetchHackathonDetail(slug) {
  const res = await fetch(`https://${slug}.devfolio.co/`, {
    headers: { "user-agent": UA },
  });
  if (!res.ok) return null;
  const data = extractNextData(await res.text());
  const q = data?.props?.pageProps?.dehydratedState?.queries?.[0];
  const arr = q?.state?.data;
  if (!Array.isArray(arr)) return null;
  const hackathon = arr[0]?.hackathons?.[0];
  return hackathon ?? null;
}

// City inference: match known Indian city names from the free-text `location`
// field — "New Town, West Bengal, India" → Kolkata, etc.
const CITY_KEYWORDS = [
  { regex: /\bbengaluru\b|\bbangalore\b/i, city: "Bengaluru" },
  { regex: /\bhyderabad\b|\bsecunderabad\b/i, city: "Hyderabad" },
  { regex: /\bmumbai\b|\bnavi mumbai\b|\bthane\b/i, city: "Mumbai" },
  { regex: /\bnew delhi\b|\bdelhi\b|\bgurgaon\b|\bgurugram\b|\bnoida\b|\bfaridabad\b|\bghaziabad\b/i, city: "Delhi" },
  { regex: /\bpune\b/i, city: "Pune" },
  { regex: /\bchennai\b|\bmadras\b/i, city: "Chennai" },
  { regex: /\bkolkata\b|\bnew town\b|\bwest bengal\b/i, city: "Kolkata" },
];

function normalizeCity(city, location) {
  const hay = `${city ?? ""} ${location ?? ""}`;
  for (const { regex, city: canonical } of CITY_KEYWORDS) {
    if (regex.test(hay)) return canonical;
  }
  return city ?? null;
}

function themesToTopics(themes) {
  const topics = new Set(["hackathon"]);
  const names = (themes ?? [])
    .map((t) => (t?.theme?.name ?? "").toLowerCase())
    .filter(Boolean);
  for (const n of names) {
    if (/\bai\b|\bml\b|genai|llm/.test(n)) topics.add("ai");
    if (/web3|blockchain|defi|nft/.test(n)) topics.add("web3");
    if (/fintech|finance/.test(n)) topics.add("fintech");
    if (/web/.test(n)) topics.add("web-dev");
    if (/mobile|android|ios/.test(n)) topics.add("mobile");
    if (/design|ui|ux/.test(n)) topics.add("design");
    if (/security|cyber/.test(n)) topics.add("security");
    if (/data|analytics/.test(n)) topics.add("data");
    if (/devops|cloud|infra/.test(n)) topics.add("devops");
    if (/open ?source/.test(n)) topics.add("open-source");
  }
  return [...topics];
}

function mapRow(h) {
  const loc = h.location ?? "";
  const city = h.is_online ? null : normalizeCity(h.city, loc);
  const description =
    (h.tagline ? `${h.tagline}. ` : "") +
    `Devfolio hackathon${city ? ` in ${city}` : h.is_online ? " (online)" : ""}. Register and read the full brief on Devfolio.`;
  return {
    id: `devfolio-${h.slug}`,
    title: h.name?.trim() ?? h.slug,
    description,
    starts_at: h.starts_at,
    ends_at: h.ends_at,
    timezone: "Asia/Kolkata",
    city,
    country: "IN",
    is_virtual: !!h.is_online,
    register_url: `https://${h.slug}.devfolio.co/`,
    organizer: "Devfolio",
    source: "devfolio",
    source_id: h.uuid ?? h.slug,
    topics: themesToTopics(h.themes),
    cover_image: h.cover_img ?? null,
    price: 0,
    is_free: true,
    deadline: h.settings?.reg_ends_at ?? null,
    difficulty: "intermediate",
    why_attend: h.tagline ?? null,
    perks: ["Devfolio prizes", "Mentors", "Swag", "Sponsor tracks"],
    interested_count: h.participants_count ?? 0,
    vibe_tags: ["competitive", "high-energy", "hands-on"],
    audience: ["students", "early-devs"],
    is_beginner_friendly: false,
    comfort_note:
      "Hackathons are team-first; if you're solo, team-up channels in Discord usually open a week before.",
    is_featured: !!h.devfolio_official,
    status: "published",
  };
}

// --- main ---

console.log("Fetching Devfolio listing…");
const listing = await fetchListing();
console.log(`Found ${listing.length} hackathons globally.`);

// For non-online hackathons we must hit the subdomain to learn location.
// For online ones the listing is enough.
console.log("Enriching in-person hackathons with detail pages…");
const enriched = [];
for (const h of listing) {
  if (h.is_online) {
    enriched.push(h);
    continue;
  }
  const detail = await fetchHackathonDetail(h.slug);
  if (detail) {
    enriched.push({ ...h, city: detail.city, country: detail.country, location: detail.location });
  } else {
    // Skip if we can't resolve location — we won't know if it's in India.
    console.warn(`  ! skipped ${h.slug} (no detail)`);
  }
}

const indiaOrOnline = enriched.filter((h) => {
  if (h.is_online) return true;
  return (h.country ?? "").toLowerCase() === "india";
});
console.log(
  `Kept ${indiaOrOnline.length} (India in-person + all online Devfolio hackathons are global — but these open to Indian builders).`,
);

// For step 3 we only want India-relevant. Drop online events that aren't
// clearly India-hosted. Heuristic: if name/tagline mention India or organizer
// is Devfolio-India branded, keep; otherwise skip online-global events.
const INDIA_SIGNAL = /\bindia\b|\biit\b|\bnit\b|\bvit\b|\biiit\b|\bbengaluru\b|\bbangalore\b|\bhyderabad\b|\bmumbai\b|\bdelhi\b|\bchennai\b|\bpune\b|\bkolkata\b/i;

const kept = indiaOrOnline.filter((h) => {
  if (!h.is_online) return true;
  const text = `${h.name ?? ""} ${h.tagline ?? ""}`;
  return INDIA_SIGNAL.test(text);
});
console.log(`India-relevant after online filter: ${kept.length}`);

if (kept.length === 0) {
  console.log("Nothing to upsert.");
  process.exit(0);
}

const rows = kept.map(mapRow);
const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error, count } = await admin
  .from("events")
  .upsert(rows, { onConflict: "source,source_id", count: "exact" });

if (error) {
  console.error("Upsert failed:", error);
  process.exit(1);
}

console.log(`✓ Upserted ${count ?? rows.length} Devfolio events`);
for (const r of rows) {
  console.log(
    `  · ${r.title} — ${r.is_virtual ? "Online" : r.city ?? "?"} — ${r.starts_at.slice(0, 10)}`,
  );
}
