# Public Website Specification

## Problem Statement

Visitors need an elegant, multilingual public site that presents the conductor’s work, schedule, media, and contact channels. Content already exists in Supabase via the admin panel; the public surface must read only currently visible records and fall back to Portuguese when translations are missing.

## Solution

Ship locale-prefixed public pages under `/pt|/en|/es` with a shared editorial chrome. Pages render on the server using the anonymous Supabase client and existing visibility/localization helpers. Contact submissions insert into `contact_messages` without email delivery in this phase.

## User Stories

1. As a visitor, I want a clear site navigation and language switcher so that I can move between sections in my language.
2. As a visitor, I want a home page that introduces the conductor and surfaces upcoming concerts and recent posts.
3. As a visitor, I want to read blog posts built from paragraph, image, and video blocks.
4. As a visitor, I want to read the biography and highlights selected for the Bio page.
5. As a visitor, I want upcoming and past concerts with venue-local times.
6. As a visitor, I want to browse published videos and photos.
7. As a visitor, I want to submit a contact message so that the conductor can respond outside the site.
8. As a visitor, I want drafts and future-scheduled content hidden so that I never see unpublished material.

## Implementation Decisions

- Public routes live under `[locale]` with paths: `/`, `/blog`, `/blog/[slug]`, `/bio`, `/agenda`, `/videos`, `/fotos`, `/contato`.
- SSR with `createClient` from `@/lib/supabase/server`; no TanStack Query on public pages.
- RLS `is_publicly_visible` remains the public-read gate; Bio also applies `show_on_page` via `bio-page` helpers.
- TipTap JSON renders to HTML with the same extensions used in the admin editor (StarterKit headings 2–3 + Underline).
- Contact form validates with Zod and inserts into `contact_messages` only (Resend deferred to delivery phase).
- next-intl `createNavigation` powers locale-aware links and the language switcher.
- Motion is light and respects `prefers-reduced-motion`.

## Testing Decisions

Tests verify public seams, not UI internals:

1. Agenda upcoming vs past partitioning by `starts_at`.
2. Blog block locale resolution with Portuguese fallback.
3. Contact payload schema rejects empty/invalid fields.
4. View-model mapping uses Portuguese when `en`/`es` are null.

## Out of Scope

Resend delivery, Vercel production hardening, analytics, soft deletes, admin redesign, and advanced SEO beyond basic page titles.
