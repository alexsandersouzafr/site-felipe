alter table public.biographies
  add column if not exists image_path text,
  add column if not exists summary_pt text not null default '',
  add column if not exists summary_en text,
  add column if not exists summary_es text;
