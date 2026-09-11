-- Tracks whether the conductor has opened a contact message in the admin panel.
alter table public.contact_messages
  add column if not exists is_read boolean not null default false;
