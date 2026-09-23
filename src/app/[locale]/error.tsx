"use client";

import { useEffect } from "react";

/**
 * Keeps a failure on the public site inside the site's own language instead
 * of Next's error screen. Deliberately plain: it has to render even when
 * whatever broke sits deeper in the page.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro no site:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center gap-6 px-6 py-24">
      <h1 className="font-heading text-4xl tracking-tight sm:text-5xl">
        Algo deu errado
      </h1>
      <p className="text-muted-foreground">
        Não foi possível carregar esta página. Tente novamente em instantes.
      </p>
      <div className="flex flex-wrap gap-4 text-xs tracking-[0.2em] uppercase">
        <button
          type="button"
          onClick={() => reset()}
          className="link-underline"
        >
          Tentar novamente
        </button>
        <a href="/" className="link-underline">
          Voltar ao início
        </a>
      </div>
    </main>
  );
}
