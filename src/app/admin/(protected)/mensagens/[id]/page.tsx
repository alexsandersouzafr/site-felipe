import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link
            href="/admin/mensagens"
            className="underline underline-offset-4"
          >
            Mensagens
          </Link>{" "}
          / Detalhe
        </p>
        <h1 className="font-heading text-3xl tracking-tight">{data.subject}</h1>
      </div>
      <dl className="space-y-4 rounded-3xl border border-border/80 p-6">
        <div>
          <dt className="text-sm text-muted-foreground">Nome</dt>
          <dd>{data.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">E-mail</dt>
          <dd>
            <a
              href={`mailto:${data.email}`}
              className="underline underline-offset-4"
            >
              {data.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Recebida em</dt>
          <dd>{new Date(data.created_at).toLocaleString("pt-BR")}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Mensagem</dt>
          <dd className="whitespace-pre-wrap">{data.message}</dd>
        </div>
      </dl>
    </div>
  );
}
