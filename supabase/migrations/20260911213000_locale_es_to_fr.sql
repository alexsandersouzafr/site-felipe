-- Replace Spanish support with French across every localized column.
-- All existing `_es` content is placeholder, so it is discarded rather than
-- carried over under the new `_fr` columns (confirmed: no real data yet).

alter table public.events rename column title_es to title_fr;
update public.events set title_fr = null;

alter table public.biographies rename column title_es to title_fr;
alter table public.biographies rename column content_es to content_fr;
alter table public.biographies rename column summary_es to summary_fr;
update public.biographies set title_fr = null, content_fr = null, summary_fr = null;

alter table public.highlights rename column title_es to title_fr;
alter table public.highlights rename column description_es to description_fr;
update public.highlights set title_fr = null, description_fr = null;

alter table public.news_items rename column title_es to title_fr;
update public.news_items set title_fr = null;

alter table public.photos rename column alt_es to alt_fr;
update public.photos set alt_fr = null;

alter table public.videos rename column title_es to title_fr;
alter table public.videos rename column description_es to description_fr;
update public.videos set title_fr = null, description_fr = null;

alter table public.home_photos rename column alt_es to alt_fr;
update public.home_photos set alt_fr = null;

alter table public.site_settings rename column intro_es to intro_fr;
update public.site_settings set intro_fr = null;
