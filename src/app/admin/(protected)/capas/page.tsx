import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-list";
import { mediaPublicUrl } from "@/lib/media-url";
import { ADMIN_PAGE_COVER_KEYS, PAGE_COVER_LABELS } from "@/lib/page-covers";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCoversIndexPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_covers")
    .select("page_key, storage_path")
    .in("page_key", [...ADMIN_PAGE_COVER_KEYS]);

  const byKey = new Map(
    (data ?? []).map((row) => [row.page_key, row.storage_path]),
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Capas das páginas"
        description="Cada página pública tem sua própria capa de topo. A capa da home fica em Fotos da home."
      />

      {error ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar as capas.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ADMIN_PAGE_COVER_KEYS.map((pageKey) => {
            const path = byKey.get(pageKey) ?? null;
            const preview = mediaPublicUrl(path);

            return (
              <li key={pageKey}>
                <Link
                  href={`/admin/capas/${pageKey}`}
                  className="group block space-y-3 rounded-3xl border border-border/80 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="overflow-hidden rounded-2xl bg-muted">
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview}
                        alt=""
                        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex aspect-[16/10] items-center justify-center text-sm text-muted-foreground">
                        Sem capa
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {PAGE_COVER_LABELS[pageKey]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Editar capa da página
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
