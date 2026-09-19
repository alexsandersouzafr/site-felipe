import Image from "next/image";

import { deletePhoto, movePhoto } from "@/app/admin/(protected)/fotos/actions";
import {
  AdminCreateLink,
  AdminEditLink,
} from "@/components/admin/admin-action-links";
import {
  AdminDataTable,
  AdminListPage,
  AdminListPanel,
  AdminPageHeader,
} from "@/components/admin/admin-list";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ReorderButtons } from "@/components/admin/reorder-buttons";
import { StatusLabel } from "@/components/admin/status-label";
import { mediaPublicUrl } from "@/lib/media-url";
import {
  ADMIN_PAGE_SIZE,
  clampPage,
  pageCount,
  pageRange,
  parsePage,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = parsePage((await searchParams).page);
  const supabase = await createClient();

  const { count: totalCount } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true });
  const totalPages = pageCount(totalCount ?? 0, ADMIN_PAGE_SIZE);
  const safePage = clampPage(page, totalPages);
  const { from, to } = pageRange(safePage, ADMIN_PAGE_SIZE);
  const pageOffset = (safePage - 1) * ADMIN_PAGE_SIZE;

  const { data, error } = await supabase
    .from("photos")
    .select("id, alt_pt, collection, status, display_order, storage_path")
    .order("display_order", { ascending: true })
    .range(from, to);

  return (
    <AdminListPage>
      <AdminPageHeader
        title="Fotos"
        description="Envie imagens para a galeria pública do site, defina texto alternativo, crédito e coleção, e use as setas para reordenar."
      />
      <AdminListPanel
        actions={
          <AdminCreateLink href="/admin/fotos/nova">Nova foto</AdminCreateLink>
        }
        pagination={{ basePath: "/admin/fotos", page: safePage, totalPages }}
      >
        {error && (
          <p className="text-sm text-destructive">
            Não foi possível carregar as fotos.
          </p>
        )}
        {!error && (data?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma foto ainda.</p>
        )}
        {(data?.length ?? 0) > 0 && (
          <AdminDataTable
            reorder={{ pageOffset, totalCount: totalCount ?? 0 }}
            headers={["Mover", "Foto", "Coleção", "Status", "Ações"]}
          >
            {data?.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border/60 last:border-0"
              >
                <td className="px-4 py-3">
                  <ReorderButtons action={movePhoto} id={item.id} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {mediaPublicUrl(item.storage_path) ? (
                      <Image
                        src={mediaPublicUrl(item.storage_path) as string}
                        alt=""
                        width={40}
                        height={40}
                        sizes="40px"
                        className="size-10 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="size-10 shrink-0 rounded-xl bg-muted" />
                    )}
                    <span className="font-medium">{item.alt_pt}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{item.collection ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusLabel status={item.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <AdminEditLink href={`/admin/fotos/${item.id}`} />
                    <ConfirmDeleteButton
                      iconOnly
                      action={deletePhoto}
                      id={item.id}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </AdminDataTable>
        )}
      </AdminListPanel>
    </AdminListPage>
  );
}
