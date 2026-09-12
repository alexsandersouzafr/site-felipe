import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

function buildHref(
  basePath: string,
  paramName: string,
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
    params.set(paramName, String(page));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export async function PublicPaginationNav({
  basePath,
  paramName = "page",
  page,
  totalPages,
  extraParams = {},
}: {
  basePath: string;
  paramName?: string;
  page: number;
  totalPages: number;
  extraParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const t = await getTranslations("Pagination");
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      className="mt-12 flex items-center justify-between gap-4"
      aria-label={t("label")}
    >
      <Link
        href={buildHref(basePath, paramName, page - 1, extraParams)}
        aria-disabled={!hasPrev}
        tabIndex={hasPrev ? undefined : -1}
        className={cn(
          "inline-flex h-9 items-center border border-border px-4 text-sm transition-colors hover:bg-muted",
          !hasPrev && "pointer-events-none opacity-40",
        )}
      >
        {t("previous")}
      </Link>
      <p className="text-sm text-muted-foreground">
        {t("pageOf", { page, totalPages })}
      </p>
      <Link
        href={buildHref(basePath, paramName, page + 1, extraParams)}
        aria-disabled={!hasNext}
        tabIndex={hasNext ? undefined : -1}
        className={cn(
          "inline-flex h-9 items-center border border-border px-4 text-sm transition-colors hover:bg-muted",
          !hasNext && "pointer-events-none opacity-40",
        )}
      >
        {t("next")}
      </Link>
    </nav>
  );
}
