-- Salted hash of the submitter's IP, used to rate-limit contact form submissions
-- without storing raw IP addresses or exposing message contents to anon reads.
alter table public.contact_messages
  add column if not exists ip_hash text;

create index if not exists contact_messages_ip_hash_created_at_idx
  on public.contact_messages (ip_hash, created_at);

-- Runs with the owner's privileges (bypassing RLS) so it can count recent rows
-- for the same ip_hash even though anon has no select policy on this table.
create or replace function public.enforce_contact_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  if new.ip_hash is not null then
    select count(*) into recent_count
    from public.contact_messages
    where ip_hash = new.ip_hash
      and created_at > now() - interval '10 minutes';

    if recent_count >= 5 then
      raise exception 'contact_rate_limited' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists contact_messages_rate_limit on public.contact_messages;
create trigger contact_messages_rate_limit
  before insert on public.contact_messages
  for each row
  execute function public.enforce_contact_rate_limit();
