-- The press page got a cover in the admin, but its key was never allowed here,
-- so saving it failed with "violates check constraint page_covers_known_keys".
-- The repertoire page, new, gets its key at the same time.
alter table public.page_covers
  drop constraint page_covers_known_keys;

alter table public.page_covers
  add constraint page_covers_known_keys check (
    page_key in (
      'home',
      'bio',
      'blog',
      'agenda',
      'videos',
      'fotos',
      'contato',
      'imprensa',
      'repertorio'
    )
  );
