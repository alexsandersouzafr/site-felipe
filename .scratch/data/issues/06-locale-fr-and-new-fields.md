# 06 — French locale and new schema for agenda/press/messages/settings

**What to build:** Replace the Spanish locale with French across every localized column, and add the schema needed for agenda favorites, the press section, contact message moderation, and a site-wide blog fallback cover.

**Blocked by:** 01 — Content foundation; 02 — Schedule data slice; 03 — Editorial content slice; 04 — Media and video slice.

**Status:** resolved

- [x] Every `_es` column (`events`, `biographies`, `highlights`, `news_items`, `photos`, `home_photos`, `site_settings`) renamed to `_fr` in one migration; existing content was placeholder and was cleared rather than translated.
- [x] `events.is_featured` added for home-page curation.
- [x] New `press_photos` table (HD upload limit, no `collection`) with the same status/visibility shape as `photos`.
- [x] `page_covers` gained an `imprensa` key.
- [x] `site_settings.blog_fallback_cover_path` added.
- [x] `contact_messages` gained `is_read` and `ip_hash`, plus a `security definer` trigger enforcing a per-IP-hash rate limit on insert (5 per 10 minutes) so the rate limit works without a public select policy.
