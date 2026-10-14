import { TrayIcon, WarningOctagonIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  deleteMessage,
  setMessageSpam,
} from "@/app/admin/(protected)/mensagens/actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { buttonVariants } from "@/components/ui/button";
import { isSafeEmailAddress } from "@/lib/public/contact";
import { SPAM_REASON_LABELS, type SpamReason } from "@/lib/public/contact-spam";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

function spamReasonLabel(reason: string | null) {
  return reason && reason in SPAM_REASON_LABELS
    ? SPAM_REASON_LABELS[reason as SpamReason]
    : "Movida para o spam manualmente";
}

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

  if (!data.is_read) {
    await supabase
      .from("contact_messages")
      .update({ is_read: true })
      .eq("id", id);
  }

  const folderHref = data.is_spam
    ? "/admin/mensagens?pasta=spam"
    : "/admin/mensagens";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href={folderHref} className="underline underline-offset-4">
            {data.is_spam ? "Spam" : "Mensagens"}
          </Link>{" "}
          / Detalhe
        </p>
        <h1 className="font-heading text-3xl tracking-tight">{data.subject}</h1>
      </div>

      {data.is_spam ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-(--radius) border border-border bg-muted/40 px-4 py-3 text-sm"
        >
          <WarningOctagonIcon
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          />
          <p>
            <span className="font-medium">Esta mensagem está no spam.</span>{" "}
            <span className="text-muted-foreground">
              {spamReasonLabel(data.spam_reason)}. Se for de verdade, devolva à
              caixa de entrada.
            </span>
          </p>
        </div>
      ) : null}

      <dl className="space-y-4 rounded-3xl border border-border/80 p-6">
        <div>
          <dt className="text-sm text-muted-foreground">Nome</dt>
          <dd>{data.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">E-mail</dt>
          <dd>
            {/* No mailto: for a quarantined message, so a scam address is
                not one click away from a reply. */}
            {!data.is_spam && isSafeEmailAddress(data.email) ? (
              <a
                href={`mailto:${data.email}`}
                className="underline underline-offset-4"
              >
                {data.email}
              </a>
            ) : (
              data.email
            )}
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

      <div className="flex flex-wrap items-center gap-2">
        <form action={setMessageSpam}>
          <input type="hidden" name="id" value={data.id} />
          <input
            type="hidden"
            name="spam"
            value={data.is_spam ? "false" : "true"}
          />
          <button
            type="submit"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {data.is_spam ? (
              <>
                <TrayIcon className="size-3.5" data-icon="inline-start" />
                Não é spam
              </>
            ) : (
              <>
                <WarningOctagonIcon
                  className="size-3.5"
                  data-icon="inline-start"
                />
                Marcar como spam
              </>
            )}
          </button>
        </form>
        <ConfirmDeleteButton
          action={deleteMessage}
          id={data.id}
          label="Apagar mensagem"
          message="Apagar esta mensagem? Não dá para desfazer."
        />
      </div>
    </div>
  );
}
