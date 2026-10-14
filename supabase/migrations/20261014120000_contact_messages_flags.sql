-- Admins could only read contact messages: opening one tried to mark it read
-- and the update was refused without an error, so every message stayed
-- "unread" forever. There was also no way to clear spam out of the inbox.

alter table public.contact_messages
  add column is_spam boolean not null default false,
  add column spam_reason text;

create index contact_messages_folder_idx
  on public.contact_messages (is_spam, created_at desc);

-- Admins may change the flags and nothing else: the column grant keeps each
-- message exactly as it arrived.
revoke update on public.contact_messages from anon, authenticated;
grant update (is_read, is_spam, spam_reason)
  on public.contact_messages to authenticated;

create policy "administrators update contact message flags"
  on public.contact_messages for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke delete on public.contact_messages from anon;

create policy "administrators delete contact messages"
  on public.contact_messages for delete to authenticated
  using (public.is_admin());
