create table public.biographies (
  id uuid primary key default gen_random_uuid(),
  status public.content_status not null default 'draft',
  publish_at timestamptz,
  title_pt text not null,
  title_en text,
  title_es text,
  content_pt jsonb not null,
  content_en jsonb,
  content_es jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scheduled_biographies_have_publish_time check (
    status <> 'scheduled' or publish_at is not null
  )
);

create table public.highlights (
  id uuid primary key default gen_random_uuid(),
  status public.content_status not null default 'draft',
  publish_at timestamptz,
  title_pt text not null,
  title_en text,
  title_es text,
  description_pt text not null,
  description_en text,
  description_es text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scheduled_highlights_have_publish_time check (
    status <> 'scheduled' or publish_at is not null
  )
);

create table public.news_items (
  id uuid primary key default gen_random_uuid(),
  status public.content_status not null default 'draft',
  publish_at timestamptz,
  slug text not null unique,
  title_pt text not null,
  title_en text,
  title_es text,
  excerpt_pt text not null,
  excerpt_en text,
  excerpt_es text,
  content_pt jsonb not null,
  content_en jsonb,
  content_es jsonb,
  cover_image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scheduled_news_have_publish_time check (
    status <> 'scheduled' or publish_at is not null
  )
);

alter table public.biographies enable row level security;
alter table public.highlights enable row level security;
alter table public.news_items enable row level security;

create policy "public reads visible biographies" on public.biographies
  for select to anon, authenticated
  using (public.is_publicly_visible(status, publish_at));
create policy "administrators manage biographies" on public.biographies
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public reads visible highlights" on public.highlights
  for select to anon, authenticated
  using (public.is_publicly_visible(status, publish_at));
create policy "administrators manage highlights" on public.highlights
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public reads visible news" on public.news_items
  for select to anon, authenticated
  using (public.is_publicly_visible(status, publish_at));
create policy "administrators manage news" on public.news_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
