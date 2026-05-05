# Apply URL Verification Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- From supabase/migrations/0003_url_verification.sql
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
```

## What changed

### Smart URL cleanup (3-strike rule)
- Events now track `url_check_failures` count
- Only archives after 3+ consecutive failures (not immediately)
- Resets count when URL recovers

### Protected organizers whitelist
- High-value events (Figma, Google, Meta, etc.) marked with `needs_manual_review`
- Never auto-archive — admin must manually review

### Admin "Archived" tab
- `/admin?tab=archived` shows recently archived events (last 7 days)
- **Restore button** to republish false positives
- Shows failure count and protected status

## Test it

1. Apply migration in Supabase
2. Visit `/admin?tab=archived`
3. Restore any Figma/design events that were wrongly archived
