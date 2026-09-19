-- Press photos come in two kinds, shown as separate sections on /imprensa:
-- photos of the conductor (portraits and publicity) and photos on stage.
-- Photos that already exist are the former, which is the column default.
create type public.press_photo_category as enum ('conductor', 'stage');

alter table public.press_photos
  add column category public.press_photo_category not null default 'conductor';

create index press_photos_category_order_idx
  on public.press_photos (category, display_order);
