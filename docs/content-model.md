# Content Model

Each editorial entity has an `id`, `status` (`draft` or `published`), timestamps, and localized `pt`, `en`, and `es` fields.

| Entity | Key fields |
| --- | --- |
| Bio | title, body, and highlights |
| News item | slug, title, summary, body, cover, and date |
| Event | title, venue, city, country, start, end, and link |
| Video | title, YouTube URL/ID, description, cover, and date |
| Photo | file, alternative text, credit, collection, and order |
| Contact | email, phone, social links, and introduction text |
| Message | name, email, subject, content, status, and date |

## Translations

Portuguese is required. English and Spanish are optional: public reads select the requested locale field and fall back to Portuguese when it is empty.
