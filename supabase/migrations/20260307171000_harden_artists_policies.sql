create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop policy if exists "artist owner can insert own profile" on public.artists;
create policy "artist owner can insert own profile"
on public.artists
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "artist owner can update own profile" on public.artists;
create policy "artist owner can update own profile"
on public.artists
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

