import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const nav = await getTranslations("Navigation");

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-heading text-xl tracking-tight">{nav("brand")}</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {t("tagline")}
          </p>
        </div>
        <Link
          href="/contato"
          className="text-sm text-foreground underline-offset-4 transition-colors hover:underline"
        >
          {t("contact")}
        </Link>
      </div>
    </footer>
  );
}
