# 08 — Press admin section and blog audio block

**What to build:** Give the conductor an admin section for press photos (separate from the public gallery) and a way to embed an audio track (Spotify, YouTube Music, or SoundCloud) inside a blog post.

**Blocked by:** 04 — Editorial CRUD; 05 — Media CRUD.

**Status:** resolved

- [x] New "Imprensa" admin section mirrors the photo CRUD (HD upload limit, no collection field, reorder arrows), backed by `press_photos`.
- [x] Blog block editor gained an "Áudio" block: pick a provider, paste a URL, validated against that provider's URL shape inline.
- [x] Bio's top-image field/upload was removed (dead code — the page already uses its page cover); the Bio page cover and the Home hero photo are now required to save in the admin, so there is no image fallback chain to maintain.
