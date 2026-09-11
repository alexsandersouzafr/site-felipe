# 13 — Press page, parallax covers, bio layout, taglines, and theme default

**What to build:** Add a public press page, apply the existing parallax effect to every page cover, move Bio's highlights into a side column, remove page taglines, and default to the light theme.

**Blocked by:** 01 — Public shell; 04 — Home; 05 — Blog; 06 — Bio; 09 — Photos (gallery).

**Status:** resolved

- [x] New `/imprensa` page: bio summary + a grid of HD photos with credit, linked from the main nav and from a CTA on `/fotos`.
- [x] `PageHero` renders its image through `ParallaxBand` (hero variant) instead of a static `<Image>`, so agenda/blog/fotos/videos/contato/bio/imprensa covers all get the home hero's subtle scroll parallax, at the same height as before.
- [x] Bio page highlights moved into a column to the right of the text, sticky on desktop while the text scrolls; above the text on mobile.
- [x] Removed the subtitle under `PageHero` titles, the home hero's descriptive paragraph, and the footer tagline.
- [x] Audited public date rendering — only the agenda already formats with the current locale dynamically; nothing else needed a fix for the French locale.
- [x] Light theme is the default on first visit (`defaultTheme="light"`); the manual toggle is unchanged, shared with the admin panel.
- [x] Contact form: honeypot field + a database-side rate limit (no CAPTCHA service).
