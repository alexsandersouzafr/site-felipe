import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
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

const arrowClassName =
  "inline-flex size-8 items-center justify-center rounded-2xl border border-border hover:bg-muted";

/** Compact previous/next control, meant for the header of an `AdminListPanel`. */
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
    <nav className="flex items-center gap-2" aria-label="Paginação">
      <Link
        href={buildHref(basePath, page - 1, extraParams)}
        aria-label="Página anterior"
        aria-disabled={!hasPrev}
        tabIndex={hasPrev ? undefined : -1}
        className={cn(
          arrowClassName,
          !hasPrev && "pointer-events-none opacity-40",
        )}
      >
        <CaretLeftIcon className="size-4" />
      </Link>
      <p className="min-w-24 text-center text-sm text-muted-foreground tabular-nums">
        Página {page} de {totalPages}
      </p>
      <Link
        href={buildHref(basePath, page + 1, extraParams)}
        aria-label="Próxima página"
        aria-disabled={!hasNext}
        tabIndex={hasNext ? undefined : -1}
        className={cn(
          arrowClassName,
          !hasNext && "pointer-events-none opacity-40",
        )}
      >
        <CaretRightIcon className="size-4" />
      </Link>
    </nav>
  );
}
