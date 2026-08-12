-- Replace TipTap news bodies with a shared block list; drop excerpts.
alter table public.news_items
  add column if not exists blocks jsonb not null default '[]'::jsonb;

alter table public.news_items
  drop column if exists excerpt_pt,
  drop column if exists excerpt_en,
  drop column if exists excerpt_es,
  drop column if exists content_pt,
  drop column if exists content_en,
  drop column if exists content_es;
