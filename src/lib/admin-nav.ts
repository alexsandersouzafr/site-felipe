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
  | "contact"
  | "messages";

export type AdminNavItem = {
  href: string;
  label: string;
  description: string;
  icon: AdminNavIconName;
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
    label: "Agenda",
    description:
      "Cadastre concertos e compromissos com data, local e fuso horário do evento",
    icon: "agenda",
  },
  {
    href: "/admin/blog",
    label: "Blog",
    description:
      "Monte postagens com parágrafos, imagens e vídeos do YouTube, com capa por upload ou galeria",
    icon: "news",
  },
  {
    href: "/admin/bio",
    label: "Biografia",
    description:
      "Edite o texto da biografia, a imagem do topo e o resumo da home",
    icon: "bio",
  },
  {
    href: "/admin/destaques",
    label: "Destaques",
    description:
      "Conquistas e highlights curtos exibidos junto à biografia pública",
    icon: "highlights",
  },
  {
    href: "/admin/home-fotos",
    label: "Fotos da home",
    description:
      "Capa/hero da home e faixas de parallax entre as seções de conteúdo",
    icon: "homePhotos",
  },
  {
    href: "/admin/capas",
    label: "Capas",
    description:
      "Capa de topo de cada página pública (biografia, blog, agenda e demais)",
    icon: "covers",
  },
  {
    href: "/admin/fotos",
    label: "Galeria",
    description:
      "Envie imagens, organize coleções e defina o que entra na galeria pública",
    icon: "photos",
  },
  {
    href: "/admin/videos",
    label: "Vídeos",
    description:
      "Cadastre vídeos do YouTube com título, descrição e ordem de exibição",
    icon: "videos",
  },
  {
    href: "/admin/contato",
    label: "Contato",
    description:
      "Atualize e-mail, telefone, redes sociais e o texto da página de contato",
    icon: "contact",
  },
  {
    href: "/admin/mensagens",
    label: "Mensagens",
    description:
      "Leia as mensagens enviadas pelo formulário público de contato",
    icon: "messages",
  },
];
