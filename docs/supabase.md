# Supabase Setup

1. Create a Supabase project.
2. Copy its project URL and publishable key into `.env.local` using `.env.example` as the template.
3. Apply the migrations in `supabase/migrations/` in filename order with the Supabase CLI or SQL Editor.
4. Create the single conductor account in Supabase Auth and set its `profiles.is_admin` value to `true`.
5. Confirm the `media` bucket exists and is public; Storage policies still restrict upload, modification, and deletion to the administrator.
6. Confirm `site_settings` has a default row and `contact_messages` exists for the admin inbox.

Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or commit credentials to the repository.

## Contact form protection

The contact form is protected in layers; each one covers what the others cannot.

**Database (`20260919130000_contact_hardening.sql`)** — enforced no matter how a row arrives, because the publishable key is public and anyone can call the REST API directly:

- Visitors cannot insert at all (`20260919150000_contact_messages_server_only.sql`): the publishable key sits in every page, so direct PostgREST inserts would skip the honeypot, the form token, the link cap and the captcha. The server writes the row with the project's secret key after its own checks, and only sets `name`, `email`, `subject`, `message` and `ip_hash`.
- Size and shape checks (name ≤ 120, subject ≤ 200, message ≤ 5000 characters, a plain `local@domain` e-mail, no control characters).
- Rate limits in the `enforce_contact_rate_limit` trigger: 5 per 10 minutes per visitor (`ip_hash`, computed by the server), 3 per hour per sender address, and 60 per hour overall. The overall ceiling means the inbox cannot be flooded; if it is ever reached the form simply refuses new messages for a while.

**Server action (`src/app/[locale]/contato/actions.ts`)** — a hidden honeypot field; a signed form token that proves the page was loaded at least 3 seconds and at most 2 hours ago; validation and cleaning of every field (control and invisible characters removed, no `?cc=`-style tricks in the address); at most 3 links per message; and, when configured, a Cloudflare Turnstile CAPTCHA.

Optional environment variables:

| Variable | Purpose |
| --- | --- |
| `SUPABASE_SECRET_KEY` | **Required.** The project's secret (service role) key, used only on the server to store contact messages. Without it the form answers "não foi possível enviar" and logs the reason. Never expose it to the browser. |
| `CONTACT_FORM_SECRET` | Signs the form token. Set a long random value in production; without it a built-in default is used. |
| `CONTACT_IP_HASH_SALT` | Salt for the visitor hash used by the per-visitor limit. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` | Turn on the Cloudflare Turnstile CAPTCHA. Both are needed; with either missing the form works without a CAPTCHA. |

The visitor's IP is read from `x-real-ip`, or the last `x-forwarded-for` entry. Make sure the hosting proxy sets one of them, otherwise the per-visitor limit has nothing to work with (the per-address and overall limits still apply).
