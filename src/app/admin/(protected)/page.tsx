import Link from "next/link";

import { AdminNavIcon } from "@/components/admin/admin-nav-icon";
import { adminNavItems } from "@/lib/admin-nav";

export default function AdminHomePage() {
  const sections = adminNavItems.filter((item) => item.href !== "/admin");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl tracking-tight">Bem-vindo</h1>
        <p className="max-w-2xl text-muted-foreground">
          Use os atalhos abaixo para gerenciar agenda, textos, mídia e mensagens
          do site. Em telas menores, abra o menu no topo para navegar entre as
          seções.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-3xl border border-border/80 bg-background/70 p-5 transition-colors hover:border-foreground/20 hover:bg-muted/40"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <AdminNavIcon
                  name={item.icon}
                  className="size-5"
                  weight="duotone"
                />
              </span>
              <div className="min-w-0">
                <h2 className="font-heading text-xl tracking-tight">
                  {item.label}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
