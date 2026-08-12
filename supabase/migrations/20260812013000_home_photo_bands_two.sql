-- Keep hero + two interstitial bands (between content sections).
-- Drop the old "band right after hero" third slot.

update public.home_photos
set
  slot = 'band_1',
  display_order = 1,
  updated_at = now()
where slot = 'band_2'
  and not exists (
    select 1 from public.home_photos as existing where existing.slot = 'band_1'
  );

update public.home_photos
set
  slot = 'band_2',
  display_order = 2,
  updated_at = now()
where slot = 'band_3'
  and not exists (
    select 1 from public.home_photos as existing where existing.slot = 'band_2'
  );

delete from public.home_photos
where slot not in ('hero', 'band_1', 'band_2');

alter table public.home_photos
  drop constraint if exists home_photos_slot_check;

alter table public.home_photos
  add constraint home_photos_slot_check check (
    slot in ('hero', 'band_1', 'band_2')
  );
