-- Cache Nominatim results so repeat ingest runs don't re-query OpenStreetMap.
-- Key is a normalized form of the geocoding query string.

create table if not exists public.geocode_cache (
  query_key text primary key,
  display_name text,
  lat double precision,
  lng double precision,
  raw jsonb,
  created_at timestamptz not null default now()
);

alter table public.geocode_cache enable row level security;
-- Only server-side (admin/service-role) writes.
-- No policies = no anon access; service role bypasses RLS.
