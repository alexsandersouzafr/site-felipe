import {
  deletePressPhoto,
  movePressPhoto,
} from "@/app/admin/(protected)/imprensa/actions";
import {
  AdminCreateLink,
  AdminEditLink,
} from "@/components/admin/admin-action-links";
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-list";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { AdminPaginationNav } from "@/components/admin/pagination-nav";
import { ReorderButtons } from "@/components/admin/reorder-buttons";
import { mediaPublicUrl } from "@/lib/media-url";
import {
  ADMIN_PAGE_SIZE,
  clampPage,
  pageCount,
  pageRange,
  parsePage,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPressPhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = parsePage((await searchParams).page);
  const supabase = await createClient();

  const { count: totalCount } = await supabase
    .from("press_photos")
    .select("id", { count: "exact", head: true });
  const totalPages = pageCount(totalCount ?? 0, ADMIN_PAGE_SIZE);
  const safePage = clampPage(page, totalPages);
  const { from, to } = pageRange(safePage, ADMIN_PAGE_SIZE);
  const pageOffset = (safePage - 1) * ADMIN_PAGE_SIZE;

  const { data, error } = await supabase
    .from("press_photos")
    .select("id, alt_pt, credit, status, display_order, storage_path")
    .order("display_order", { ascending: true })
    .range(from, to);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Imprensa"
        description="Fotos em alta resolução com crédito, disponibilizadas para jornalistas no kit de imprensa. Use as setas para reordenar."
        action={
          <AdminCreateLink href="/admin/imprensa/nova">
            Nova foto
          </AdminCreateLink>
        }
      />
      {error && (
        <p className="text-sm text-destructive">
          Não foi possível carregar as fotos de imprensa.
        </p>
      )}
      {!error && (data?.length ?? 0) === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhuma foto de imprensa ainda.
        </p>
      )}
      {(data?.length ?? 0) > 0 && (
        <AdminDataTable
          headers={["Mover", "Foto", "Crédito", "Status", "Ações"]}
        >
          {data?.map((item, index) => (
            <tr
              key={item.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className="px-4 py-3">
                <ReorderButtons
                  action={movePressPhoto}
                  id={item.id}
                  disabledUp={pageOffset + index === 0}
                  disabledDown={pageOffset + index === (totalCount ?? 0) - 1}
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {item.storage_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaPublicUrl(item.storage_path) ?? undefined}
                      alt=""
                      className="size-10 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="size-10 shrink-0 rounded-xl bg-muted" />
                  )}
                  <span className="font-medium">{item.alt_pt}</span>
                </div>
              </td>
              <td className="px-4 py-3">{item.credit ?? "—"}</td>
              <td className="px-4 py-3">{item.status}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <AdminEditLink href={`/admin/imprensa/${item.id}`} />
                  <ConfirmDeleteButton
                    action={deletePressPhoto}
                    id={item.id}
                  />
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}

      <AdminPaginationNav basePath="/admin/imprensa" page={safePage} totalPages={totalPages} />
    </div>
  );
}
