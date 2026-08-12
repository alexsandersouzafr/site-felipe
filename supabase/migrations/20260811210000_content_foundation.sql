create type public.content_status as enum ('draft', 'scheduled', 'published');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

create policy "users read their own profile" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "administrators read profiles" on public.profiles
  for select to authenticated
  using (public.is_admin());

create policy "administrators manage profiles" on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create function public.is_publicly_visible(
  status public.content_status,
  publish_at timestamptz
)
returns boolean
language sql
stable
as $$
  select status = 'published'
    or (status = 'scheduled' and publish_at is not null and publish_at <= now());
$$;
