# Content Model

Each editorial entity has an `id`, `status` (`draft`, `scheduled`, or `published`), timestamps, and localized `pt`, `en`, and `fr` fields where applicable.

| Entity | Key fields |
| --- | --- |
| Bio | singleton: TipTap body, home summary; top image is the Bio page cover; highlights listed on the Bio page |
| Highlight | title, description, `display_order`, `show_on_page` |
| Blog post (`news_items`) | slug, title, cover image path, ordered `blocks` |
| Event | title, image, venue, city, country, start, end, and link |
| Video | title, YouTube URL/ID, description, cover, and date |
| Photo (gallery) | file, alternative text, credit, collection, and order |
| Home photo | ordered HD parallax bands for the home page |
| Page cover | one top image per public page key (`home`, `bio`, `blog`, `agenda`, `videos`, `fotos`, `contato`) |
| Contact | email, phone, social links, and introduction text |
| Message | name, email, subject, content, status, and date |

## Blog posts

Blog posts no longer use TipTap or excerpts. The body is a shared list of blocks stored in `blocks` (JSONB):

- `paragraph` — optional localized title + TipTap rich text body (PT required; EN/FR optional), edited per-language tabs
- `image` — Storage path under the public `media` bucket + optional localized caption
- `video` — YouTube URL

Cover images are chosen by upload (`blog/covers/...`) or by selecting an existing photo from the gallery. Block images upload to `blog/blocks/...`. Soft upload limit: **5 MB**, JPEG/PNG/WebP/GIF.

## Home photos and page covers

- **Home photos** (`home_photos`) are ordered full-width parallax bands. The first is the home hero; the rest appear between home sections.
- **Page covers** (`page_covers`) set the top image for each public page. The Bio cover and the Home hero (`home_photos`, slot `hero`) are required in the admin — there is no image fallback for either.
- Home/cover uploads use the HD soft limit: **15 MB**, JPEG/PNG/WebP/GIF, under `home/parallax/...` and `covers/...`.

## Biography

There is a single biography record. Saving in the admin panel overwrites it (no version history).

- Fields: localized TipTap `content_*`, and localized plain-text `summary_*` for the home page. The top image comes from the Bio page cover (`page_covers`), not from a field on this record.
- Portuguese body and summary are required; English/French are optional with Portuguese fallback.
- The public Bio page title comes from i18n, not from an editorial title field.
- Saving always publishes the biography (`status = published`, `show_on_page = true`).

## Bio page highlights

The public Bio page also shows up to **10 highlights**, in a sticky right-hand column next to the biography text on desktop (above the text on mobile).

- Admins choose highlights with `show_on_page`.
- Public reads require both `show_on_page = true` and public visibility (`published`, or `scheduled` with `publish_at <= now`).
- Highlight order on the page follows `display_order` among the selected items; admins reorder with up/down arrows in the admin table instead of an "Ordem" form field.

## Translations

Portuguese is required. English and French are optional: public reads select the requested locale field and fall back to Portuguese when it is empty.
