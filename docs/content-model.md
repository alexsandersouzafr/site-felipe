# Content Model

Each editorial entity has an `id`, `status` (`draft`, `scheduled`, or `published`), timestamps, and localized `pt`, `en`, and `es` fields.

| Entity | Key fields |
| --- | --- |
| Bio | title, body, `show_on_page`, and highlights |
| Highlight | title, description, `display_order`, `show_on_page` |
| News item | slug, title, summary, body, cover, and date |
| Event | title, venue, city, country, start, end, and link |
| Video | title, YouTube URL/ID, description, cover, and date |
| Photo | file, alternative text, credit, collection, and order |
| Contact | email, phone, social links, and introduction text |
| Message | name, email, subject, content, status, and date |

## Bio page selection

The public Bio page shows at most **one biography** and up to **10 highlights**.

- Admins choose content with `show_on_page`.
- Public reads require both `show_on_page = true` and public visibility (`published`, or `scheduled` with `publish_at <= now`).
- At most one biography may have `show_on_page = true` (enforced by a partial unique index).
- Highlight order on the page follows `display_order` among the selected items.

## Translations

Portuguese is required. English and Spanish are optional: public reads select the requested locale field and fall back to Portuguese when it is empty.
