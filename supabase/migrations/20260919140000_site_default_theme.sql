-- The theme the public site opens in, chosen in the admin (Aparência).
-- A visitor who switches theme keeps their own choice in their browser.
alter table public.site_settings
  add column default_theme text not null default 'light'
    constraint site_settings_default_theme
    check (default_theme in ('light', 'dark', 'system'));
