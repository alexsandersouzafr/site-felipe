alter table public.home_photos
  add column if not exists slot text;

with ranked as (
  select
    id,
    row_number() over (order by display_order asc, created_at asc) as rn
  from public.home_photos
)
update public.home_photos as photo
set slot = case ranked.rn
  when 1 then 'hero'
  when 2 then 'band_1'
  when 3 then 'band_2'
  when 4 then 'band_3'
  else null
end
from ranked
where photo.id = ranked.id
  and photo.slot is null;

delete from public.home_photos
where slot is null
   or slot not in ('hero', 'band_1', 'band_2', 'band_3');

alter table public.home_photos
  alter column slot set not null;

alter table public.home_photos
  drop constraint if exists home_photos_slot_check;

alter table public.home_photos
  add constraint home_photos_slot_check check (
    slot in ('hero', 'band_1', 'band_2', 'band_3')
  );

create unique index if not exists home_photos_slot_unique
  on public.home_photos (slot);
