create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  contact_email text,
  contact_phone text,
  intro_pt text not null default '',
  intro_en text,
  intro_es text,
  social_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (intro_pt)
values ('Entre em contato para convites e parcerias.');

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.contact_messages enable row level security;

create policy "public reads site settings" on public.site_settings
  for select to anon, authenticated
  using (true);

create policy "administrators manage site settings" on public.site_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "visitors submit contact messages" on public.contact_messages
  for insert to anon, authenticated
  with check (true);

create policy "administrators read contact messages" on public.contact_messages
  for select to authenticated
  using (public.is_admin());
