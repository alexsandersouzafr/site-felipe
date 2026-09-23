"use client";

import { ArrowClockwiseIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * The last line of defence for the admin. Anything that still throws lands
 * here instead of on Next's error screen, with a way back into the panel.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          <h1 className="text-lg font-bold">Algo deu errado</h1>
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar esta tela. Tente novamente — se o erro
            continuar, recarregue a página ou volte ao painel.
          </p>
          {error.digest ? (
            <p className="text-xs text-muted-foreground">
              Código do erro: <code>{error.digest}</code>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onPress={() => reset()}>
            <ArrowClockwiseIcon className="size-4" data-icon="inline-start" />
            Tentar novamente
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
