create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  attended boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create index if not exists reviews_event_idx on public.reviews (event_id);
alter table public.reviews enable row level security;

create policy "reviews are publicly readable" on public.reviews for select using (true);
create policy "reviews insertable by owner" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews updatable by owner" on public.reviews for update using (auth.uid() = user_id);
