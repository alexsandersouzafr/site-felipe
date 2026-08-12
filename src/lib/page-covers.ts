/** Capas editáveis no painel (a capa da home fica em Fotos da home). */
export const ADMIN_PAGE_COVER_KEYS = [
  "bio",
  "blog",
  "agenda",
  "videos",
  "fotos",
  "contato",
] as const;

export type AdminPageCoverKey = (typeof ADMIN_PAGE_COVER_KEYS)[number];

/** Todas as chaves persistidas em page_covers, inclusive home. */
export const PAGE_COVER_KEYS = ["home", ...ADMIN_PAGE_COVER_KEYS] as const;

export type PageCoverKey = (typeof PAGE_COVER_KEYS)[number];

export const PAGE_COVER_LABELS: Record<PageCoverKey, string> = {
  home: "Home",
  bio: "Biografia",
  blog: "Blog",
  agenda: "Agenda",
  videos: "Vídeos",
  fotos: "Galeria",
  contato: "Contato",
};

export function isPageCoverKey(value: string): value is PageCoverKey {
  return (PAGE_COVER_KEYS as readonly string[]).includes(value);
}

export function isAdminPageCoverKey(value: string): value is AdminPageCoverKey {
  return (ADMIN_PAGE_COVER_KEYS as readonly string[]).includes(value);
}
