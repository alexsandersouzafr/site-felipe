-- Contact messages are now written only by the Next.js server, with the
-- project's secret key, after the honeypot, the signed form token, the link
-- cap and (when configured) the Turnstile captcha have been checked.
--
-- Until now visitors could insert directly: the publishable key is in every
-- page, so a bot could POST to PostgREST and skip all of those checks, with
-- only the size, shape and rate limits of the database left in its way.
revoke insert (name, email, subject, message, ip_hash)
  on public.contact_messages from anon, authenticated;
revoke insert on public.contact_messages from anon, authenticated;

drop policy if exists "visitors submit contact messages" on public.contact_messages;
