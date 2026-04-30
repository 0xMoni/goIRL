#!/usr/bin/env node
// Geocode events missing lat/lng via Nominatim (OpenStreetMap).
// Respects their 1 req/sec limit and caches results to geocode_cache table.
//
// Usage:
//   node scripts/geocode-events.mjs            # geocode everything missing
//   node scripts/geocode-events.mjs --limit 20 # cap for testing

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

const limitArg = process.argv.indexOf("--limit");
const LIMIT = limitArg !== -1 ? Number(process.argv[limitArg + 1]) : Infinity;

// Nominatim's terms require a real User-Agent including contact info.
const UA = "goirl-geocoder/1.0 (monikumari04428@gmail.com)";
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const RATE_LIMIT_MS = 1100;

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalize(s) {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

function buildQuery(event) {
  const parts = [];
  if (event.venue) parts.push(event.venue);
  if (event.city) parts.push(event.city);
  parts.push("India");
  return parts.filter(Boolean).join(", ");
}

async function lookupCache(queryKey) {
  const { data } = await admin
    .from("geocode_cache")
    .select("lat, lng, display_name")
    .eq("query_key", queryKey)
    .maybeSingle();
  return data;
}

async function saveCache(queryKey, hit, raw) {
  await admin.from("geocode_cache").upsert({
    query_key: queryKey,
    display_name: hit.display_name,
    lat: Number(hit.lat),
    lng: Number(hit.lon),
    raw,
  });
}

async function nominatim(query) {
  const url = `${NOMINATIM}?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "user-agent": UA, "accept": "application/json" } });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  const json = await res.json();
  return json?.[0] ?? null;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// --- main ---

const { data: events, error } = await admin
  .from("events")
  .select("id, title, city, venue, lat, lng, is_virtual")
  .eq("status", "published")
  .or("lat.is.null,lng.is.null");

if (error) {
  console.error("load failed:", error);
  process.exit(1);
}

const targets = (events ?? [])
  .filter((e) => !e.is_virtual && e.city)
  .slice(0, LIMIT);

console.log(`Events to geocode: ${targets.length}`);

let hitsFromCache = 0;
let hitsFromApi = 0;
let misses = 0;
let lastApiAt = 0;

for (const e of targets) {
  const query = buildQuery(e);
  const key = normalize(query);

  let result = await lookupCache(key);
  if (result) {
    hitsFromCache++;
  } else {
    // Rate-limit: at most one API call every RATE_LIMIT_MS
    const wait = lastApiAt + RATE_LIMIT_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastApiAt = Date.now();
    try {
      const hit = await nominatim(query);
      if (hit) {
        result = { lat: Number(hit.lat), lng: Number(hit.lon), display_name: hit.display_name };
        await saveCache(key, hit, hit);
        hitsFromApi++;
      } else {
        misses++;
        console.log(`  ? no match: ${e.title} @ ${query}`);
      }
    } catch (err) {
      console.warn(`  ! api error for ${e.id}:`, err.message);
      misses++;
    }
  }

  if (result) {
    const { error: updErr } = await admin
      .from("events")
      .update({ lat: result.lat, lng: result.lng })
      .eq("id", e.id);
    if (updErr) console.warn(`  ! update failed for ${e.id}:`, updErr.message);
  }
}

console.log(`✓ Done: ${hitsFromCache} cached, ${hitsFromApi} new, ${misses} misses`);
