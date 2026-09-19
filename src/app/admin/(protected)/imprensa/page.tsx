import Image from "next/image";

import {
  deletePressPhoto,
  movePressPhoto,
} from "@/app/admin/(protected)/imprensa/actions";
import {
  AdminCreateLink,
  AdminEditLink,
  AdminTabLinks,
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
import {
  DEFAULT_PRESS_PHOTO_CATEGORY,
  PRESS_PHOTO_CATEGORIES,
  PRESS_PHOTO_CATEGORY_LABELS,
  parsePressPhotoCategory,
} from "@/lib/press-categories";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPressPhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoria?: string }>;
}) {
  const { page: pageParam, categoria } = await searchParams;
  const category =
    parsePressPhotoCategory(categoria) ?? DEFAULT_PRESS_PHOTO_CATEGORY;
  const page = parsePage(pageParam);
  const supabase = await createClient();

  // Each section has its own list, order and page count.
  const counts = await Promise.all(
    PRESS_PHOTO_CATEGORIES.map(async (item) => {
      const { count } = await supabase
        .from("press_photos")
        .select("id", { count: "exact", head: true })
        .eq("category", item);
      return [item, count ?? 0] as const;
    }),
  );
  const countByCategory = Object.fromEntries(counts);
  const totalCount = countByCategory[category] ?? 0;
  const totalPages = pageCount(totalCount, ADMIN_PAGE_SIZE);
  const safePage = clampPage(page, totalPages);
  const { from, to } = pageRange(safePage, ADMIN_PAGE_SIZE);
  const pageOffset = (safePage - 1) * ADMIN_PAGE_SIZE;

  const { data, error } = await supabase
    .from("press_photos")
    .select("id, alt_pt, credit, status, display_order, storage_path")
    .eq("category", category)
    .order("display_order", { ascending: true })
    .range(from, to);

  const { label } = PRESS_PHOTO_CATEGORY_LABELS[category];

  return (
    <AdminListPage>
      <AdminPageHeader
        title="Imprensa"
        description="Fotos em alta resolução com crédito para o kit de imprensa, em duas seções: fotos do maestro (publicidade) e fotos no palco. Cada seção tem a sua própria ordem; use as setas para reordenar."
      />
      <AdminListPanel
        filters={
          <AdminTabLinks
            label="Seção da imprensa"
            items={PRESS_PHOTO_CATEGORIES.map((item) => ({
              href: `/admin/imprensa?categoria=${item}`,
              label: `${PRESS_PHOTO_CATEGORY_LABELS[item].label} (${countByCategory[item] ?? 0})`,
              active: item === category,
            }))}
          />
        }
        actions={
          <AdminCreateLink href={`/admin/imprensa/nova?categoria=${category}`}>
            Nova foto
          </AdminCreateLink>
        }
        pagination={{
          basePath: "/admin/imprensa",
          page: safePage,
          totalPages,
          extraParams: { categoria: category },
        }}
      >
        {error && (
          <p className="text-sm text-destructive">
            Não foi possível carregar as fotos de imprensa.
          </p>
        )}
        {!error && (data?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma foto em “{label}” ainda.
          </p>
        )}
        {(data?.length ?? 0) > 0 && (
          <AdminDataTable
            reorder={{ pageOffset, totalCount }}
            headers={["Mover", "Foto", "Crédito", "Status", "Ações"]}
          >
            {data?.map((item) => {
              const src = mediaPublicUrl(item.storage_path);

              return (
                <tr
                  key={item.id}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-4 py-3">
                    <ReorderButtons action={movePressPhoto} id={item.id} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {src ? (
                        // The originals are large (up to 15 MB): let Next
                        // serve a thumbnail instead of the file itself.
                        <Image
                          src={src}
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
                  <td className="px-4 py-3">{item.credit ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusLabel status={item.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <AdminEditLink href={`/admin/imprensa/${item.id}`} />
                      <ConfirmDeleteButton
                        iconOnly
                        action={deletePressPhoto}
                        id={item.id}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </AdminDataTable>
        )}
      </AdminListPanel>
    </AdminListPage>
  );
}
