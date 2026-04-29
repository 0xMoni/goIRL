#!/usr/bin/env node
// Ingest MLH India hackathons into the events table.
// Usage: node scripts/ingest-mlh.mjs [season]
//   season defaults to current year

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

const season = process.argv[2] ?? new Date().getFullYear();
const seasonUrl = `https://www.mlh.com/seasons/${season}/events`;

console.log(`Fetching ${seasonUrl}`);
const res = await fetch(seasonUrl, {
  redirect: "follow",
  headers: { "user-agent": "goirl-ingest/1.0 (+https://goirl.in)" },
});
if (!res.ok) {
  console.error(`MLH fetch failed: ${res.status}`);
  process.exit(1);
}
const html = await res.text();

const match = html.match(/<div id="app" data-page="([^"]+)"/);
if (!match) {
  console.error("Could not find Inertia data-page on MLH page");
  process.exit(1);
}
const decoded = match[1]
  .replace(/&quot;/g, '"')
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&#039;/g, "'");
const page = JSON.parse(decoded);

const upcoming = page?.props?.upcomingEvents ?? [];
console.log(`Found ${upcoming.length} upcoming MLH events globally`);

const indiaEvents = upcoming.filter(
  (e) => e.venueAddress?.country === "IN",
);
console.log(`Filtered to ${indiaEvents.length} India events`);

function mapRow(e) {
  const websiteUrl = e.websiteUrl || `https://mlh.io${e.url ?? ""}`;
  const isVirtual = e.formatType === "digital";
  const topics = ["hackathon"];
  // MLH events are broadly student hackathons; tag accordingly
  const vibeTags = ["competitive", "high-energy", "hands-on"];
  const audience = ["students", "early-devs"];
  return {
    id: `mlh-${e.slug}`,
    title: e.name.trim(),
    description: `${e.name.trim()} is a hackathon in the MLH ${season} season${
      e.venueAddress?.city ? `, hosted in ${e.venueAddress.city}` : ""
    }. ${e.dateRange ? `Runs ${e.dateRange}.` : ""} Register and see full details on the organizer's site.`.trim(),
    starts_at: e.startsAt,
    ends_at: e.endsAt,
    timezone: "Asia/Kolkata",
    city: e.venueAddress?.city ?? null,
    country: "IN",
    is_virtual: isVirtual,
    register_url: websiteUrl,
    organizer: "MLH",
    source: "mlh",
    source_id: e.id,
    topics,
    cover_image: e.backgroundUrl ?? null,
    price: 0,
    is_free: true,
    difficulty: "intermediate",
    why_attend:
      "An MLH official hackathon — expect structured tracks, sponsor prizes, and builders from across the country.",
    perks: ["MLH swag", "Sponsor prizes", "Mentors on-site", "Free food"],
    vibe_tags: vibeTags,
    audience,
    is_beginner_friendly: true,
    comfort_note:
      "MLH events are student-heavy and friendly to first-timers - many folks show up solo and team up on day one.",
    is_featured: false,
    status: "published",
  };
}

const rows = indiaEvents.map(mapRow);

if (rows.length === 0) {
  console.log("Nothing to upsert.");
  process.exit(0);
}

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

console.log(`✓ Upserted ${count ?? rows.length} MLH India events`);
for (const r of rows) {
  console.log(`  · ${r.title} — ${r.city} — ${r.starts_at.slice(0, 10)}`);
}
