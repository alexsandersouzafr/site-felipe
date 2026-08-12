alter table public.home_photos
  add column if not exists object_position text not null default '50% 28%';

alter table public.page_covers
  add column if not exists object_position text not null default '50% 28%';
