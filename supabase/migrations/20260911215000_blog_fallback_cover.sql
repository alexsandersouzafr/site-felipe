-- Site-wide fallback cover used by blog posts that don't have their own cover image.
alter table public.site_settings
  add column if not exists blog_fallback_cover_path text;
