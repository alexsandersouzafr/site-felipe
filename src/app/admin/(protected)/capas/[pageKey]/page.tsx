import Link from "next/link";
import { notFound } from "next/navigation";

import { savePageCover } from "@/app/admin/(protected)/capas/actions";
import { AdminPageHeader } from "@/components/admin/admin-list";
import { PageCoverForm } from "@/components/admin/page-cover-form";
import { DEFAULT_IMAGE_FOCUS } from "@/lib/image-focus";
import {
  type AdminPageCoverKey,
  isAdminPageCoverKey,
  PAGE_COVER_LABELS,
} from "@/lib/page-covers";
import { createClient } from "@/lib/supabase/server";

type PageCoverEditProps = {
  params: Promise<{ pageKey: string }>;
};

export default async function AdminPageCoverEditPage({
  params,
}: PageCoverEditProps) {
  const { pageKey: rawKey } = await params;
  if (!isAdminPageCoverKey(rawKey)) {
    notFound();
  }
  const pageKey = rawKey as AdminPageCoverKey;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_covers")
    .select("storage_path, object_position")
    .eq("page_key", pageKey)
    .maybeSingle();

  const boundAction = savePageCover.bind(null, pageKey);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/admin/capas"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Capas das páginas
        </Link>
        <AdminPageHeader
          title={`Capa · ${PAGE_COVER_LABELS[pageKey]}`}
          description="Imagem de topo desta página pública."
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar a capa.
        </p>
      ) : (
        <PageCoverForm
          pageKey={pageKey}
          action={boundAction}
          initialCover={{
            storagePath: data?.storage_path ?? null,
            objectPosition: data?.object_position || DEFAULT_IMAGE_FOCUS,
          }}
        />
      )}
    </div>
  );
}
