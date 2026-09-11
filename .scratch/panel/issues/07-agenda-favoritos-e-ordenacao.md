# 07 — Agenda favorites, table reordering, list thumbnails, read/unread inbox

**What to build:** Let the conductor curate featured events, reorder highlights/videos/photos directly from the admin table instead of a form field, preview a video thumbnail while editing, see small covers in list tables, and see which contact messages are unread.

**Blocked by:** 03 — Schedule CRUD; 04 — Editorial CRUD; 05 — Media CRUD; 06 — Contact settings and inbox.

**Status:** resolved

- [x] Star toggle + Todos/Favoritos filter in the `/admin/agenda` table, backed by `events.is_featured`.
- [x] Up/down arrow buttons (same interaction as the blog block editor) reorder highlights, videos, and photos in their admin tables; the numeric "Ordem" field is gone from those forms, and new rows append to the end (`src/lib/reorder.ts`).
- [x] Blog, video, and photo admin list tables show a small cover/thumbnail per row.
- [x] The video form shows the YouTube thumbnail as soon as the URL is recognized.
- [x] The admin nav label "Galeria" was renamed to "Fotos" to match the public site.
- [x] Contact messages list shows unread state (dot + bold name); opening a message marks it read automatically.
