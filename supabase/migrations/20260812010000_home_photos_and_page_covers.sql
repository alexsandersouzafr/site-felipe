create table public.home_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  alt_pt text not null,
  alt_en text,
  alt_es text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.page_covers (
  page_key text primary key,
  storage_path text,
  updated_at timestamptz not null default now(),
  constraint page_covers_known_keys check (
    page_key in (
      'home',
      'bio',
      'blog',
      'agenda',
      'videos',
      'fotos',
      'contato'
    )
  )
);

insert into public.page_covers (page_key)
values
  ('home'),
  ('bio'),
  ('blog'),
  ('agenda'),
  ('videos'),
  ('fotos'),
  ('contato');

alter table public.home_photos enable row level security;
alter table public.page_covers enable row level security;

create policy "public reads home photos" on public.home_photos
  for select to anon, authenticated
  using (true);

create policy "administrators manage home photos" on public.home_photos
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "public reads page covers" on public.page_covers
  for select to anon, authenticated
  using (true);

create policy "administrators manage page covers" on public.page_covers
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
