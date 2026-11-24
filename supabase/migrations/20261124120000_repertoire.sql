-- The works the conductor performs, shown on /repertorio in two columns
-- (classical and popular) and grouped by composer. Composer names are matched
-- as typed, so the admin suggests the ones already in use.
create table public.repertoire_works (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  composer text not null check (length(btrim(composer)) > 0),
  genre text not null check (genre in ('classical', 'popular')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index repertoire_works_listing_idx
  on public.repertoire_works (genre, composer, title);

alter table public.repertoire_works enable row level security;

-- No drafts here: a work is public as soon as it is saved.
create policy "public reads the repertoire" on public.repertoire_works
  for select to anon, authenticated
  using (true);

create policy "administrators manage the repertoire" on public.repertoire_works
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
