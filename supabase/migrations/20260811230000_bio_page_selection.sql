alter table public.biographies
  add column show_on_page boolean not null default false;

alter table public.highlights
  add column show_on_page boolean not null default false;

create unique index biographies_one_show_on_page
  on public.biographies (show_on_page)
  where show_on_page = true;
