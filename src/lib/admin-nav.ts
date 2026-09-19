export type AdminNavIconName =
  | "home"
  | "agenda"
  | "news"
  | "bio"
  | "highlights"
  | "homePhotos"
  | "covers"
  | "photos"
  | "videos"
  | "press"
  | "contact"
  | "messages";

export type AdminNavGroupLabel = "Conteúdo" | "Mídia" | "Site";

export type AdminNavItem = {
  href: string;
  label: string;
  description: string;
  icon: AdminNavIconName;
  /** Section of the menu the item sits under; the home shortcut has none. */
  group?: AdminNavGroupLabel;
};

export const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Início",
    description: "Atalhos para todas as áreas de conteúdo do painel",
    icon: "home",
  },
  {
    href: "/admin/agenda",
    group: "Conteúdo",
    label: "Agenda",
    description:
      "Cadastre concertos e compromissos com data, local e fuso horário do evento",
    icon: "agenda",
  },
  {
    href: "/admin/blog",
    group: "Conteúdo",
    label: "Blog",
    description:
      "Monte postagens com parágrafos, imagens e vídeos do YouTube, com capa por upload ou galeria",
    icon: "news",
  },
  {
    href: "/admin/bio",
    group: "Conteúdo",
    label: "Biografia",
    description: "Edite o texto da biografia e o resumo da home",
    icon: "bio",
  },
  {
    href: "/admin/destaques",
    group: "Conteúdo",
    label: "Destaques",
    description:
      "Conquistas e highlights curtos exibidos junto à biografia pública",
    icon: "highlights",
  },
  {
    href: "/admin/home-fotos",
    group: "Mídia",
    label: "Fotos da home",
    description:
      "Capa/hero da home e faixas de parallax entre as seções de conteúdo",
    icon: "homePhotos",
  },
  {
    href: "/admin/capas",
    group: "Mídia",
    label: "Capas",
    description:
      "Capa de topo de cada página pública (biografia, blog, agenda e demais)",
    icon: "covers",
  },
  {
    href: "/admin/fotos",
    group: "Mídia",
    label: "Fotos",
    description:
      "Envie imagens, organize coleções e defina o que entra na galeria pública",
    icon: "photos",
  },
  {
    href: "/admin/videos",
    group: "Mídia",
    label: "Vídeos",
    description:
      "Cadastre vídeos do YouTube com título, descrição e ordem de exibição",
    icon: "videos",
  },
  {
    href: "/admin/imprensa",
    group: "Mídia",
    label: "Imprensa",
    description:
      "Fotos em alta resolução com crédito para o kit de imprensa público",
    icon: "press",
  },
  {
    href: "/admin/contato",
    group: "Site",
    label: "Contato",
    description:
      "Atualize e-mail, telefone, redes sociais e o texto da página de contato",
    icon: "contact",
  },
  {
    href: "/admin/mensagens",
    group: "Site",
    label: "Mensagens",
    description:
      "Leia as mensagens enviadas pelo formulário público de contato",
    icon: "messages",
  },
];

export type AdminNavGroup = {
  label: AdminNavGroupLabel;
  items: AdminNavItem[];
};

/** Menu sections in order, each holding its items in menu order. */
export const adminNavGroups: AdminNavGroup[] = adminNavItems.reduce<
  AdminNavGroup[]
>((groups, item) => {
  if (!item.group) {
    return groups;
  }

  const current = groups.find((group) => group.label === item.group);
  if (current) {
    current.items.push(item);
  } else {
    groups.push({ label: item.group, items: [item] });
  }

  return groups;
}, []);

export function isAdminNavItemActive(href: string, pathname: string) {
  return (
    pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`))
  );
}
