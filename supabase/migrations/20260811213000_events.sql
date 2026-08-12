create table public.events (
  id uuid primary key default gen_random_uuid(),
  status public.content_status not null default 'draft',
  publish_at timestamptz,
  title_pt text not null,
  title_en text,
  title_es text,
  venue text not null,
  city text not null,
  country text not null,
  time_zone text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  ticket_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_end_after_start check (ends_at is null or ends_at >= starts_at),
  constraint scheduled_events_have_publish_time check (
    status <> 'scheduled' or publish_at is not null
  )
);

create index events_public_schedule_index
  on public.events (starts_at)
  where status in ('published', 'scheduled');

alter table public.events enable row level security;

create policy "public reads visible events" on public.events
  for select to anon, authenticated
  using (public.is_publicly_visible(status, publish_at));

create policy "administrators manage events" on public.events
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
