-- Contact form hardening.
--
-- The publishable key is public, so anyone can call the REST API directly and
-- skip everything the Next.js server action does (honeypot, validation, the
-- IP hash used for rate limiting). This makes the database itself enforce the
-- rules, whatever the caller.

-- 1. Visitors may only fill in the fields the form collects. They can no
--    longer set is_read, created_at or id.
revoke insert on public.contact_messages from anon, authenticated;
grant insert (name, email, subject, message, ip_hash)
  on public.contact_messages to anon, authenticated;

-- 2. Shape and size limits, the same ones the form applies. NOT VALID checks
--    new rows only, so messages already in the inbox are never rejected.
alter table public.contact_messages
  add constraint contact_messages_name_length
    check (char_length(name) between 1 and 120) not valid,
  add constraint contact_messages_subject_length
    check (char_length(subject) between 1 and 200) not valid,
  add constraint contact_messages_message_length
    check (char_length(message) between 1 and 5000) not valid,
  add constraint contact_messages_email_shape
    check (
      char_length(email) <= 254
      and email ~ '^[^[:space:]@?&=#%<>",;:]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$'
    ) not valid,
  -- Single-line fields carry no control characters; the message may keep its
  -- line breaks and tabs.
  add constraint contact_messages_no_control_characters
    check (
      name !~ '[[:cntrl:]]'
      and subject !~ '[[:cntrl:]]'
      and email !~ '[[:cntrl:]]'
      and message !~ '[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]'
    ) not valid;

-- 3. Rate limits that do not depend on the caller being honest. ip_hash is
--    supplied by the server action, so a direct caller can leave it out or
--    make it up; the per-sender and overall limits below still apply.
create index if not exists contact_messages_email_created_at_idx
  on public.contact_messages (lower(email), created_at);

create or replace function public.enforce_contact_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Same visitor (hash of the IP computed by the server): 5 per 10 minutes.
  if new.ip_hash is not null and (
    select count(*) from public.contact_messages
    where ip_hash = new.ip_hash
      and created_at > now() - interval '10 minutes'
  ) >= 5 then
    raise exception 'contact_rate_limited' using errcode = 'P0001';
  end if;

  -- Same sender address: 3 per hour.
  if (
    select count(*) from public.contact_messages
    where lower(email) = lower(new.email)
      and created_at > now() - interval '1 hour'
  ) >= 3 then
    raise exception 'contact_rate_limited' using errcode = 'P0001';
  end if;

  -- Overall ceiling: 60 per hour, so the inbox can never be flooded however
  -- the requests arrive. (If it is reached, the form is closed for a while
  -- rather than the inbox filling up.)
  if (
    select count(*) from public.contact_messages
    where created_at > now() - interval '1 hour'
  ) >= 60 then
    raise exception 'contact_rate_limited' using errcode = 'P0001';
  end if;

  return new;
end;
$$;
