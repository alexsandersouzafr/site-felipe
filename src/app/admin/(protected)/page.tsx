import {
  ArrowRightIcon,
  EnvelopeSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { AdminNavIcon } from "@/components/admin/admin-nav-icon";
import { adminNavGroups } from "@/lib/admin-nav";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = await createClient();
  // Spam is left out: a scam that arrives every few days would otherwise keep
  // the alert on for good, and it would stop meaning anything.
  const { count: unreadCount } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false)
    .eq("is_spam", false);

  return (
    <div className="space-y-10">
      {unreadCount ? (
        <Link
          href="/admin/mensagens"
          className="group flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm transition-colors hover:border-primary/60"
        >
          <EnvelopeSimpleIcon
            aria-hidden="true"
            weight="duotone"
            className="size-5 shrink-0 text-primary"
          />
          <span className="flex-1">
            <span className="font-medium">Você tem mensagens não lidas.</span>{" "}
            <span className="text-muted-foreground">
              {unreadCount === 1
                ? "1 mensagem esperando na caixa de entrada."
                : `${unreadCount} mensagens esperando na caixa de entrada.`}
            </span>
          </span>
          <ArrowRightIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      ) : null}

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
