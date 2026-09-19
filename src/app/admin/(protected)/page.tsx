import Link from "next/link";

import { AdminNavIcon } from "@/components/admin/admin-nav-icon";
import { adminNavGroups } from "@/lib/admin-nav";

export default function AdminHomePage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl tracking-tight">Bem-vindo</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Use os atalhos abaixo para gerenciar agenda, textos, mídia e mensagens
          do site. Em telas menores, abra o menu no topo para navegar entre as
          seções.
        </p>
      </div>

      {adminNavGroups.map((group) => (
        <section key={group.label} aria-labelledby={`group-${group.label}`}>
          <h2
            id={`group-${group.label}`}
            className="border-b border-border/80 pb-2 text-[0.6875rem] font-medium tracking-[0.14em] text-muted-foreground uppercase"
          >
            {group.label}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-4 rounded-xl border border-border/80 p-4 transition-colors hover:border-foreground/30 hover:bg-muted/40"
              >
                <AdminNavIcon
                  name={item.icon}
                  className="mt-0.5 size-6 text-primary"
                  weight="duotone"
                />
                <div className="min-w-0">
                  <h3 className="font-heading text-lg tracking-tight">
                    {item.label}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
