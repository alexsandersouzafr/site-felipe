-- Lets the conductor curate which events are featured on the home page.
alter table public.events
  add column if not exists is_featured boolean not null default false;
