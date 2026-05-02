#!/usr/bin/env node
// Archive events whose registration URLs are dead (404/410/gone).
// Safe to run on cron after ingestion.

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
  .select("id, title, register_url")
  .eq("status", "published");

if (error) {
  console.error("load failed:", error);
  process.exit(1);
}

console.log(`Checking ${events.length} events for dead URLs…`);

const toArchive = [];

for (const e of events) {
  try {
    const res = await fetch(e.register_url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 404 || res.status === 410) {
      toArchive.push(e.id);
      console.log(`  ✗ ${e.title.slice(0, 50)} → ${res.status}`);
    }
  } catch {
    // Network error / timeout — don't archive, might be temporary
  }
}

if (toArchive.length === 0) {
  console.log("✓ All URLs alive.");
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

console.log(`✓ Archived ${toArchive.length} dead events.`);
