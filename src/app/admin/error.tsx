"use client";

import { ArrowClockwiseIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { type AdminErrorKind, classifyAdminError } from "@/lib/admin-errors";

const COPY: Record<AdminErrorKind, { title: string; body: string }> = {
  connection: {
    title: "A resposta do servidor não chegou",
    body: "Isso costuma acontecer quando a sessão termina ou a conexão cai no meio de um salvamento. Recarregue a página — se ela pedir o login, entre novamente. O que estava sendo preenchido precisa ser refeito.",
  },
  outdated: {
    title: "O painel foi atualizado",
    body: "Uma versão nova do painel foi publicada enquanto esta tela estava aberta. Recarregue a página para continuar. O que estava sendo preenchido precisa ser refeito.",
  },
  unknown: {
    title: "Algo deu errado",
    body: "Não foi possível carregar esta tela. Recarregue a página — se o erro continuar, volte ao painel.",
  },
};

/**
 * The last line of defence for the admin. Anything that still throws lands
 * here instead of on Next's error screen. The two failures people actually
 * meet — a session that ended, a deploy while the tab was open — both clear
 * with a full reload, so that is the first button; `reset()` only redraws the
 * same screen and would fail the same way.
 */
export default function AdminError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const kind = classifyAdminError(error);
  const { title, body } = COPY[kind];

  useEffect(() => {
    console.error("Erro no painel admin:", error);
  }, [error]);

  return (
    <div className="admin-area flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-5 rounded-(--radius) border border-destructive/30 bg-card p-6">
        <WarningCircleIcon
          weight="fill"
          aria-hidden="true"
          className="size-7 text-destructive"
        />
        <div className="space-y-2">
          <h1 className="text-lg font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{body}</p>
          {error.digest ? (
            <p className="text-xs text-muted-foreground">
              Código do erro: <code>{error.digest}</code>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onPress={() => window.location.reload()}>
            <ArrowClockwiseIcon className="size-4" data-icon="inline-start" />
            Recarregar a página
          </Button>
          <Button
            variant="outline"
            onPress={() => window.location.assign("/admin")}
          >
            Voltar ao painel
          </Button>
        </div>
      </div>
    </div>
  );
}
