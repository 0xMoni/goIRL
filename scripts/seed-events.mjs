#!/usr/bin/env node
// Seed events.json into the Supabase events table.
// NOTE: One-time seed script — NOT part of the daily ingest cron.
//       Daily ingestion is handled by ingest-mlh, ingest-luma, ingest-devfolio.
// Usage: node scripts/seed-events.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

// Minimal .env.local loader so we don't need an extra dep.
function loadDotEnv(path) {
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");
loadDotEnv(join(projectRoot, ".env.local"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing SUPABASE env vars in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const events = JSON.parse(
  readFileSync(join(projectRoot, "src/data/events.json"), "utf8"),
);

function camelToSnake(event) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    starts_at: event.startsAt,
    ends_at: event.endsAt,
    timezone: event.timezone ?? "Asia/Kolkata",
    city: event.city,
    country: event.country ?? "IN",
    is_virtual: event.isVirtual ?? false,
    register_url: event.registerUrl,
    organizer: event.organizer,
    source: event.source,
    source_id: event.sourceId,
    topics: event.topics ?? [],
    cover_image: event.coverImage ?? null,
    price: event.price ?? null,
    is_free: event.isFree ?? (event.price === 0 || event.price == null),
    deadline: event.deadline ?? null,
    tags: event.tags ?? null,
    difficulty: event.difficulty ?? null,
    why_attend: event.whyAttend ?? null,
    perks: event.perks ?? null,
    interested_count: event.interestedCount ?? 0,
    vibe_tags: event.vibeTags ?? null,
    audience: event.audience ?? null,
    is_beginner_friendly: event.isBeginnerFriendly ?? false,
    comfort_note: event.comfortNote ?? null,
    is_featured: event.isFeatured ?? false,
    lat: event.lat ?? null,
    lng: event.lng ?? null,
    venue: event.venue ?? null,
    status: "published",
  };
}

const rows = events.map(camelToSnake);

console.log(`Seeding ${rows.length} events…`);

const { error, count } = await admin
  .from("events")
  .upsert(rows, { onConflict: "id", count: "exact" });

if (error) {
  console.error("Seed failed:", error);
  process.exit(1);
}

console.log(`Upserted ${count ?? rows.length} rows into events.`);
