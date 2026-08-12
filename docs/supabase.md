# Supabase Setup

1. Create a Supabase project.
2. Copy its project URL and publishable key into `.env.local` using `.env.example` as the template.
3. Apply the migrations in `supabase/migrations/` in filename order with the Supabase CLI or SQL Editor.
4. Create the single conductor account in Supabase Auth and set its `profiles.is_admin` value to `true`.
5. Confirm the `media` bucket exists and is public; Storage policies still restrict upload, modification, and deletion to the administrator.
6. Confirm `site_settings` has a default row and `contact_messages` exists for the admin inbox.

Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or commit credentials to the repository.
