export type AdminNavItem = {
  href: string;
  label: string;
  description: string;
};

export const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Início",
    description: "Visão geral do painel",
  },
  {
    href: "/admin/agenda",
    label: "Agenda",
    description: "Concertos e compromissos",
  },
  {
    href: "/admin/noticias",
    label: "Notícias",
    description: "Artigos e novidades",
  },
  {
    href: "/admin/bio",
    label: "Biografia",
    description: "Texto principal da bio",
  },
  {
    href: "/admin/destaques",
    label: "Destaques",
    description: "Conquistas e highlights",
  },
  {
    href: "/admin/fotos",
    label: "Fotos",
    description: "Galeria de imagens",
  },
  {
    href: "/admin/videos",
    label: "Vídeos",
    description: "Vídeos do YouTube",
  },
  {
    href: "/admin/contato",
    label: "Contato",
    description: "Dados da página de contato",
  },
  {
    href: "/admin/mensagens",
    label: "Mensagens",
    description: "Caixa de entrada do formulário",
  },
];
