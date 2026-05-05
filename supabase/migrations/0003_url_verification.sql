-- Add URL verification tracking to events table
-- Prevents aggressive auto-archiving of temporarily broken URLs

alter table public.events
  add column if not exists url_check_failures integer not null default 0,
  add column if not exists last_url_check timestamptz,
  add column if not exists needs_manual_review boolean not null default false;

create index if not exists events_needs_review_idx
  on public.events (needs_manual_review)
  where needs_manual_review = true;

comment on column public.events.url_check_failures is
  'Number of consecutive failed URL checks. Reset to 0 on success. Archive after 3+ failures.';

comment on column public.events.last_url_check is
  'Timestamp of last URL validation check';

comment on column public.events.needs_manual_review is
  'Flag for high-value events (Figma, Google, etc.) that should not auto-archive';
