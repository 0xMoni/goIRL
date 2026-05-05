#!/usr/bin/env node
// Smart URL verification: 3-strike rule before archiving, whitelist for high-value organizers.
// Safe to run on cron after ingestion.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

// High-value organizers that should never auto-archive
const PROTECTED_ORGANIZERS = [
  "figma",
  "google",
  "microsoft",
  "meta",
  "amazon",
  "adobe",
  "apple",
  "netflix",
  "stripe",
  "vercel",
  "github",
  "gitlab",
];

function isProtected(organizer, title) {
  const searchText = `${organizer} ${title}`.toLowerCase();
  return PROTECTED_ORGANIZERS.some((org) => searchText.includes(org));
}

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
loadDotEnv(join(__dirname, "..", ".env.local"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: events, error } = await admin
  .from("events")
  .select("id, title, register_url, organizer, url_check_failures, needs_manual_review")
  .eq("status", "published");

if (error) {
  console.error("load failed:", error);
  process.exit(1);
}

// Step 1: Archive past events (ended more than 24h ago)
const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const { data: pastEvents } = await admin
  .from("events")
  .select("id, title")
  .eq("status", "published")
  .lt("ends_at", cutoff);

if (pastEvents && pastEvents.length > 0) {
  const pastIds = pastEvents.map((e) => e.id);
  const { error: pastErr } = await admin
    .from("events")
    .update({ status: "archived" })
    .in("id", pastIds);
  if (pastErr) console.error("Past archive failed:", pastErr);
  else console.log(`Archived ${pastIds.length} past events.`);
} else {
  console.log("No past events to archive.");
}

// Step 2: Smart URL verification with 3-strike rule
console.log(`Checking ${events.length} events for dead URLs…`);

const toArchive = [];
const toFlag = [];
const toReset = [];

for (const e of events) {
  // Skip protected events
  if (e.needs_manual_review || isProtected(e.organizer, e.title)) {
    if (!e.needs_manual_review) {
      toFlag.push(e.id);
      console.log(`  🛡️  Protected: ${e.title.slice(0, 50)}`);
    }
    continue;
  }

  let urlAlive = false;

  try {
    // Try HEAD first
    let res = await fetch(e.register_url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    // If HEAD fails with method not allowed, try GET
    if (res.status === 405) {
      res = await fetch(e.register_url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });
    }

    if (res.status === 404 || res.status === 410) {
      const failures = (e.url_check_failures || 0) + 1;

      if (failures >= 3) {
        toArchive.push(e.id);
        console.log(`  ✗ ${e.title.slice(0, 50)} → ${res.status} (strike ${failures}, archiving)`);
      } else {
        await admin
          .from("events")
          .update({
            url_check_failures: failures,
            last_url_check: new Date().toISOString(),
          })
          .eq("id", e.id);
        console.log(`  ⚠️  ${e.title.slice(0, 50)} → ${res.status} (strike ${failures}/3)`);
      }
    } else if (res.ok) {
      urlAlive = true;
      // Reset failure count if URL is alive
      if (e.url_check_failures > 0) {
        toReset.push(e.id);
      }
    }
  } catch (err) {
    // Network error / timeout — don't count as failure, might be temporary
    console.log(`  ⏱️  ${e.title.slice(0, 50)} → timeout/network error (not counted)`);
  }

  // Update last check timestamp
  if (urlAlive || toArchive.includes(e.id)) {
    await admin
      .from("events")
      .update({ last_url_check: new Date().toISOString() })
      .eq("id", e.id);
  }
}

// Mark protected organizers for manual review
if (toFlag.length > 0) {
  await admin
    .from("events")
    .update({ needs_manual_review: true })
    .in("id", toFlag);
  console.log(`\n🛡️  Flagged ${toFlag.length} high-value events for manual review.`);
}

// Reset failure counts for recovered URLs
if (toReset.length > 0) {
  await admin
    .from("events")
    .update({ url_check_failures: 0 })
    .in("id", toReset);
  console.log(`✓ Reset failure count for ${toReset.length} recovered URLs.`);
}

// Archive events with 3+ strikes
if (toArchive.length === 0) {
  console.log("\n✓ No events to archive.");
  process.exit(0);
}

const { error: archiveErr } = await admin
  .from("events")
  .update({ status: "archived" })
  .in("id", toArchive);

if (archiveErr) {
  console.error("Archive failed:", archiveErr);
  process.exit(1);
}

console.log(`\n✓ Archived ${toArchive.length} events (3+ failed checks).`);
