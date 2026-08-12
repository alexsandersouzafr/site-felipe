export type AdminNavIconName =
  | "home"
  | "agenda"
  | "news"
  | "bio"
  | "highlights"
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
    href: "/admin/noticias",
    label: "Notícias",
    description:
      "Escreva e publique artigos com texto rico, resumo, capa e traduções",
    icon: "news",
  },
  {
    href: "/admin/bio",
    label: "Biografia",
    description:
      "Mantenha versões da biografia e escolha qual texto aparece no site",
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
    href: "/admin/fotos",
    label: "Fotos",
    description:
      "Envie imagens, organize coleções e defina o que entra na galeria",
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
