-- goIRL initial schema.
-- Uses Supabase Auth (auth.users) as source of truth for identity;
-- profiles table holds app-specific user data.

-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- events
-- ============================================================
create table if not exists public.events (
  id text primary key,
  title text not null,
  description text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'Asia/Kolkata',
  city text,
  country text not null default 'IN',
  is_virtual boolean not null default false,
  register_url text not null,
  organizer text not null,
  source text not null,
  source_id text not null,
  topics text[] not null default '{}',
  cover_image text,
  price numeric,
  is_free boolean not null default true,
  deadline timestamptz,
  tags text[],
  difficulty text,
  why_attend text,
  perks text[],
  interested_count integer default 0,
  vibe_tags text[],
  audience text[],
  is_beginner_friendly boolean default false,
  comfort_note text,
  is_featured boolean default false,
  lat double precision,
  lng double precision,
  venue text,
  status text not null default 'published' check (status in ('published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_id)
);

create index if not exists events_starts_at_idx on public.events (starts_at);
create index if not exists events_city_idx on public.events (city);
create index if not exists events_status_idx on public.events (status);
create index if not exists events_topics_gin on public.events using gin (topics);

alter table public.events enable row level security;

-- Published events are world-readable.
create policy "events are publicly readable"
  on public.events for select
  using (status = 'published');

-- ============================================================
-- rsvps
-- ============================================================
create table if not exists public.rsvps (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

alter table public.rsvps enable row level security;

create policy "rsvps readable by owner"
  on public.rsvps for select using (auth.uid() = user_id);

create policy "rsvps insertable by owner"
  on public.rsvps for insert with check (auth.uid() = user_id);

create policy "rsvps deletable by owner"
  on public.rsvps for delete using (auth.uid() = user_id);

-- ============================================================
-- followed_topics
-- ============================================================
create table if not exists public.followed_topics (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, topic)
);

alter table public.followed_topics enable row level security;

create policy "followed_topics readable by owner"
  on public.followed_topics for select using (auth.uid() = user_id);
create policy "followed_topics insertable by owner"
  on public.followed_topics for insert with check (auth.uid() = user_id);
create policy "followed_topics deletable by owner"
  on public.followed_topics for delete using (auth.uid() = user_id);

-- ============================================================
-- preferred_cities
-- ============================================================
create table if not exists public.preferred_cities (
  user_id uuid not null references auth.users(id) on delete cascade,
  city text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, city)
);

alter table public.preferred_cities enable row level security;

create policy "preferred_cities readable by owner"
  on public.preferred_cities for select using (auth.uid() = user_id);
create policy "preferred_cities insertable by owner"
  on public.preferred_cities for insert with check (auth.uid() = user_id);
create policy "preferred_cities deletable by owner"
  on public.preferred_cities for delete using (auth.uid() = user_id);

-- ============================================================
-- pending_events (user submissions, moderator queue)
-- ============================================================
create table if not exists public.pending_events (
  id uuid primary key default gen_random_uuid(),
  submitter_id uuid references auth.users(id) on delete set null,
  submitter_email text,
  title text not null,
  description text not null,
  why_attend text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  deadline timestamptz,
  city text,
  is_virtual boolean not null default false,
  register_url text not null,
  organizer text not null,
  topics text[] not null default '{}',
  difficulty text,
  price numeric,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  moderator_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists pending_events_status_idx
  on public.pending_events (status, created_at desc);

alter table public.pending_events enable row level security;

-- Anyone (even anon) can submit an event.
create policy "anyone can submit pending events"
  on public.pending_events for insert
  with check (true);

-- Submitters can read their own submissions.
create policy "submitters can read own submissions"
  on public.pending_events for select
  using (submitter_id is not null and auth.uid() = submitter_id);
