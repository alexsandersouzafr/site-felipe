-- Press kit: high-resolution photos with credits, separate from the public
-- photo gallery, using the HD upload limit (15MB) instead of the 5MB gallery limit.
create table public.press_photos (
  id uuid primary key default gen_random_uuid(),
  status public.content_status not null default 'draft',
  publish_at timestamptz,
  storage_path text not null unique,
  alt_pt text not null,
  alt_en text,
  alt_fr text,
  credit text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scheduled_press_photos_have_publish_time check (
    status <> 'scheduled' or publish_at is not null
  )
);

alter table public.press_photos enable row level security;

create policy "public reads visible press photos" on public.press_photos
  for select to anon, authenticated
  using (public.is_publicly_visible(status, publish_at));
create policy "administrators manage press photos" on public.press_photos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
