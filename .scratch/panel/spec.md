# Administrative Panel Specification

## Problem Statement

The conductor needs a private, friendly control panel to manage every editable part of the website without calling a developer. Public visitors must never reach this surface.

## Solution

Ship a custom Portuguese-language admin experience at `/admin`, protected by Supabase email/password authentication and an `is_admin` profile check. The conductor can create, edit, schedule, publish, and hard-delete schedule, news, bio, highlights, photos, videos, and contact settings, and can read contact form submissions.

## User Stories

1. As the conductor, I want to sign in with email and password so that only I can manage the site.
2. As the conductor, I want to reset my password by email so that I can recover access without developer help.
3. As the conductor, I want unauthenticated visitors blocked from `/admin` so that content stays private.
4. As the conductor, I want a clear navigation shell so that I can move between content areas quickly.
5. As the conductor, I want to manage concerts with timezone-aware dates so that the public schedule stays accurate.
6. As the conductor, I want to draft, schedule, or publish news with TipTap rich text so that articles look polished.
7. As the conductor, I want to edit biography and highlights so that the Bio page stays current.
8. As the conductor, I want to upload photos and register YouTube videos so that galleries stay up to date.
9. As the conductor, I want to edit contact page details so that visitors see the correct channels.
10. As the conductor, I want to read contact form submissions so that I can respond outside the site.
11. As the conductor, I want Portuguese required and English/French optional on forms so that incomplete translations do not block publishing.
12. As the conductor, I want hard delete with confirmation so that I can remove obsolete content safely.

## Implementation Decisions

- Admin routes live under `/admin` outside locale prefixes; public site stays under `/pt|/en|/fr`.
- Admin chrome is Portuguese-only; content forms expose `pt`, `en`, and `fr` fields.
- Auth uses Supabase email/password plus password-reset email flow.
- Access requires an authenticated user with `profiles.is_admin = true`.
- Publishing UX is a status select (`draft` | `scheduled` | `published`) plus required `publish_at` when scheduled.
- TipTap covers biography body and news body only; highlight descriptions remain plain text.
- Contact page configuration lives in a single settings row.
- Contact inbox is read-only (list + detail).
- Deletes are hard deletes after confirmation.
- Forms use TanStack Form + Zod; tables use TanStack Table; client data uses TanStack Query where interactive.
- A migration adds `site_settings` and `contact_messages` because they are required by this panel and are not yet in the schema.

## Testing Decisions

Tests verify public behavior at these seams, not UI internals:

1. Auth gate — unauthenticated users cannot reach protected admin routes; non-admins are rejected.
2. Publishing form rules — scheduled status requires `publish_at`; required Portuguese fields reject empty values.
3. Localized form payload — empty `en`/`fr` stay null and do not overwrite `pt`.

## Out of Scope

Public page layouts, Resend delivery wiring for the contact form, multilingual admin chrome, soft deletes, and Vercel production hardening beyond what the panel needs locally.

## Further Notes

Supabase credentials already exist in local env. Migrations for settings and contact messages must be applied before those panel sections work against a live project.

### Later additions (see `.scratch/panel/issues/07-agenda-favoritos-e-ordenacao.md` and `08-imprensa-e-audio.md`)

- Agenda favorites: a star toggle + Todos/Favoritos filter in the `/admin/agenda` table, backed by `events.is_featured`.
- Reordering by table: highlights, videos, photos, and press photos use up/down arrow buttons in the admin list (same interaction as the blog block editor) instead of a numeric "Ordem" field; new rows append to the end.
- List thumbnails: blog, video, and photo admin tables now show a small cover/thumbnail per row (agenda already had one).
- Video preview: pasting a YouTube URL in the video form shows its thumbnail immediately.
- Inbox now shows read/unread state (`contact_messages.is_read`) — opening a message marks it read automatically, reversing the earlier "mark-as-read inbox actions" out-of-scope call.
- New "Imprensa" section (HD photos + credit) mirrors the photo CRUD; "Galeria" was renamed to "Fotos" in the nav to match the public site.
- The bio record's top-image field/upload was removed; the Bio page cover and the Home hero photo are now required in the admin instead.
