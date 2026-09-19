/** The public site's pages, in menu order (labels live in `Navigation`). */
export const PUBLIC_NAV_ITEMS = [
  { href: "/", key: "home" },
  { href: "/blog", key: "news" },
  { href: "/bio", key: "bio" },
  { href: "/agenda", key: "schedule" },
  { href: "/videos", key: "videos" },
  { href: "/fotos", key: "photos" },
  { href: "/imprensa", key: "press" },
  { href: "/contato", key: "contact" },
] as const;

export function isPublicNavItemActive(href: string, pathname: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}
