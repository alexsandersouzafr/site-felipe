# Data Foundation Specification

## Problem Statement

The conductor needs a reliable, low-maintenance source of truth for all website content. Public visitors must only see content that is published or whose scheduled publication time has arrived, while the authenticated conductor must be able to manage localized editorial content, events, photos, and videos.

## Solution

Use Supabase for Postgres, Auth, and Storage. Model public content with Portuguese as the required canonical language and English/Spanish as optional translations that fall back to Portuguese. Protect write operations with Row Level Security. Support scheduled publication through `publish_at` evaluated during public reads, avoiding a required cron service.

## User Stories

1. As the conductor, I want to create an event with a venue and local timezone so that concert details remain correct internationally.
2. As the conductor, I want to schedule content for future publication so that it appears automatically at the chosen time.
3. As a visitor, I want to see only currently public content so that I never encounter drafts or future announcements.
4. As a visitor, I want content in my chosen language so that I can read the site comfortably.
5. As a visitor, I want untranslated content to use Portuguese so that sections are never unexpectedly empty.
6. As the conductor, I want to maintain rich biographical and news content through a visual editor so that I do not need to write markup.
7. As the conductor, I want to upload photos and register YouTube videos so that galleries are manageable from the panel.
8. As the conductor, I want private administrative access so that visitors cannot alter content.

## Implementation Decisions

- Supabase is connected later through environment variables; all schema changes are versioned migrations.
- A single authenticated profile marked as administrator can manage content.
- Content states are `draft`, `scheduled`, and `published`.
- Public reads include published content and scheduled content only after `publish_at`.
- Events store timestamps in UTC plus an IANA timezone identifier for the venue.
- Rich bio and news fields use TipTap-compatible structured content.
- Photo files are served from a public media bucket; administrative uploads and writes remain protected by RLS.
- Videos store YouTube metadata and do not store video files.

## Testing Decisions

Tests verify public behavior rather than database implementation details. The agreed seams are public-content selection by status and publication time, localized-value fallback to Portuguese, and correct event-time conversion from stored UTC plus IANA timezone. There is no existing test prior art in this new repository.

## Out of Scope

Administrative UI, authentication screens, contact-message delivery, scheduled jobs, final public page layouts, and Vercel deployment are out of scope.

## Further Notes

The scheduled-read model keeps hosting costs low. A later cron process is optional only if the product needs side effects at the moment of publication, such as social posting or notification delivery.
