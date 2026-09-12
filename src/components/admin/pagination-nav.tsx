import Link from "next/link";

import { cn } from "@/lib/utils";

function buildHref(
  basePath: string,
  page: number,
  extraParams: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(extraParams)) {
    if (value) {
      params.set(key, value);
    }
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function AdminPaginationNav({
  basePath,
  page,
  totalPages,
  extraParams = {},
}: {
  basePath: string;
  page: number;
  totalPages: number;
  extraParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      className="flex items-center justify-between gap-4 pt-2"
      aria-label="Paginação"
    >
      <Link
        href={buildHref(basePath, page - 1, extraParams)}
        aria-disabled={!hasPrev}
        tabIndex={hasPrev ? undefined : -1}
        className={cn(
          "inline-flex h-8 items-center rounded-2xl border border-border px-3 text-sm hover:bg-muted",
          !hasPrev && "pointer-events-none opacity-40",
        )}
      >
        Anterior
      </Link>
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </p>
      <Link
        href={buildHref(basePath, page + 1, extraParams)}
        aria-disabled={!hasNext}
        tabIndex={hasNext ? undefined : -1}
        className={cn(
          "inline-flex h-8 items-center rounded-2xl border border-border px-3 text-sm hover:bg-muted",
          !hasNext && "pointer-events-none opacity-40",
        )}
      >
        Próxima
      </Link>
    </nav>
  );
}
