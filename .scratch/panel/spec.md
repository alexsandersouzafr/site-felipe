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
11. As the conductor, I want Portuguese required and English/Spanish optional on forms so that incomplete translations do not block publishing.
12. As the conductor, I want hard delete with confirmation so that I can remove obsolete content safely.

## Implementation Decisions

- Admin routes live under `/admin` outside locale prefixes; public site stays under `/pt|/en|/es`.
- Admin chrome is Portuguese-only; content forms expose `pt`, `en`, and `es` fields.
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
3. Localized form payload — empty `en`/`es` stay null and do not overwrite `pt`.

## Out of Scope

Public page layouts, Resend delivery wiring for the contact form, multilingual admin chrome, soft deletes, mark-as-read inbox actions, and Vercel production hardening beyond what the panel needs locally.

## Further Notes

Supabase credentials already exist in local env. Migrations for settings and contact messages must be applied before those panel sections work against a live project.
