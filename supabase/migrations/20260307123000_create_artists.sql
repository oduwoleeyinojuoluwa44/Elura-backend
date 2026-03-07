create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  username text not null unique,
  full_name text not null,
  bio text,
  location text,
  specialty text[] not null default '{}',
  price_range text,
  instagram_handle text,
  profile_image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint artists_username_lowercase check (username = lower(username)),
  constraint artists_username_format check (username ~ '^[a-z0-9_]+$')
);

create index if not exists artists_published_idx
on public.artists (is_published);

create index if not exists artists_location_idx
on public.artists (location);

create index if not exists artists_price_range_idx
on public.artists (price_range);

create index if not exists artists_specialty_gin_idx
on public.artists
using gin (specialty);

drop trigger if exists set_artists_updated_at on public.artists;

create trigger set_artists_updated_at
before update on public.artists
for each row
execute function public.set_updated_at();

alter table public.artists enable row level security;

drop policy if exists "public can read published artists" on public.artists;
create policy "public can read published artists"
on public.artists
for select
using (is_published = true);

drop policy if exists "artist owner can insert own profile" on public.artists;
create policy "artist owner can insert own profile"
on public.artists
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "artist owner can update own profile" on public.artists;
create policy "artist owner can update own profile"
on public.artists
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

