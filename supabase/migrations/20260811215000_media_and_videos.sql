insert into storage.buckets (id, name, public)
values ('media', 'media', true);

create policy "administrators upload media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

create policy "administrators update media" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

create policy "administrators delete media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  status public.content_status not null default 'draft',
  publish_at timestamptz,
  storage_path text not null unique,
  alt_pt text not null,
  alt_en text,
  alt_es text,
  credit text,
  collection text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scheduled_photos_have_publish_time check (
    status <> 'scheduled' or publish_at is not null
  )
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  status public.content_status not null default 'draft',
  publish_at timestamptz,
  youtube_url text not null,
  title_pt text not null,
  title_en text,
  title_es text,
  description_pt text,
  description_en text,
  description_es text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scheduled_videos_have_publish_time check (
    status <> 'scheduled' or publish_at is not null
  ),
  constraint videos_use_youtube check (
    youtube_url ~ '^https?://(www\.)?(youtube\.com|youtu\.be)/'
  )
);

alter table public.photos enable row level security;
alter table public.videos enable row level security;

create policy "public reads visible photos" on public.photos
  for select to anon, authenticated
  using (public.is_publicly_visible(status, publish_at));
create policy "administrators manage photos" on public.photos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public reads visible videos" on public.videos
  for select to anon, authenticated
  using (public.is_publicly_visible(status, publish_at));
create policy "administrators manage videos" on public.videos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
