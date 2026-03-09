create table if not exists public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists (id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint portfolio_images_sort_order_non_negative check (sort_order >= 0)
);

create index if not exists portfolio_images_artist_sort_idx
on public.portfolio_images (artist_id, sort_order, created_at);

create index if not exists portfolio_images_artist_created_idx
on public.portfolio_images (artist_id, created_at);

alter table public.portfolio_images enable row level security;

drop policy if exists "public can read portfolio images for published artists" on public.portfolio_images;
create policy "public can read portfolio images for published artists"
on public.portfolio_images
for select
using (
  exists (
    select 1
    from public.artists
    where public.artists.id = public.portfolio_images.artist_id
      and public.artists.is_published = true
  )
);

drop policy if exists "artist owner can insert own portfolio images" on public.portfolio_images;
create policy "artist owner can insert own portfolio images"
on public.portfolio_images
for insert
to authenticated
with check (
  exists (
    select 1
    from public.artists
    where public.artists.id = public.portfolio_images.artist_id
      and public.artists.user_id = (select auth.uid())
  )
);

drop policy if exists "artist owner can update own portfolio images" on public.portfolio_images;
create policy "artist owner can update own portfolio images"
on public.portfolio_images
for update
to authenticated
using (
  exists (
    select 1
    from public.artists
    where public.artists.id = public.portfolio_images.artist_id
      and public.artists.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.artists
    where public.artists.id = public.portfolio_images.artist_id
      and public.artists.user_id = (select auth.uid())
  )
);

drop policy if exists "artist owner can delete own portfolio images" on public.portfolio_images;
create policy "artist owner can delete own portfolio images"
on public.portfolio_images
for delete
to authenticated
using (
  exists (
    select 1
    from public.artists
    where public.artists.id = public.portfolio_images.artist_id
      and public.artists.user_id = (select auth.uid())
  )
);
