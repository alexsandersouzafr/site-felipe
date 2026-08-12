import Link from "next/link";

import { adminNavItems } from "@/lib/admin-nav";

export default function AdminHomePage() {
  const sections = adminNavItems.filter((item) => item.href !== "/admin");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl tracking-tight">Bem-vindo</h1>
        <p className="max-w-2xl text-muted-foreground">
          Escolha uma seção para gerenciar o conteúdo do site. Em telas menores,
          use o menu no topo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-3xl border border-border/80 bg-background/70 p-5 transition-colors hover:border-foreground/20 hover:bg-muted/40"
          >
            <h2 className="font-heading text-xl tracking-tight">
              {item.label}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
