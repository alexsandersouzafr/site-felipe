import Image from "next/image";

import { deleteVideo, moveVideo } from "@/app/admin/(protected)/fotos/actions";
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
import {
  ADMIN_PAGE_SIZE,
  clampPage,
  pageCount,
  pageRange,
  parsePage,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId } from "@/lib/youtube";

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = parsePage((await searchParams).page);
  const supabase = await createClient();

  const { count: totalCount } = await supabase
    .from("videos")
    .select("id", { count: "exact", head: true });
  const totalPages = pageCount(totalCount ?? 0, ADMIN_PAGE_SIZE);
  const safePage = clampPage(page, totalPages);
  const { from, to } = pageRange(safePage, ADMIN_PAGE_SIZE);
  const pageOffset = (safePage - 1) * ADMIN_PAGE_SIZE;

  const { data, error } = await supabase
    .from("videos")
    .select("id, title_pt, youtube_url, status, display_order")
    .order("display_order", { ascending: true })
    .range(from, to);

  return (
    <AdminListPage>
      <AdminPageHeader
        title="Vídeos"
        description="Cadastre vídeos hospedados no YouTube com título e descrição, e use as setas para reordenar. Publique, agende ou mantenha em rascunho até estarem prontos."
      />
      <AdminListPanel
        actions={
          <AdminCreateLink href="/admin/videos/nova">
            {" "}
            Novo vídeo{" "}
          </AdminCreateLink>
        }
        pagination={{ basePath: "/admin/videos", page: safePage, totalPages }}
      >
        {error && (
          <p className="text-sm text-destructive">
            Não foi possível carregar os vídeos.
          </p>
        )}
        {!error && (data?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum vídeo ainda.</p>
        )}
        {(data?.length ?? 0) > 0 && (
          <AdminDataTable
            reorder={{ pageOffset, totalCount: totalCount ?? 0 }}
            headers={["Mover", "Vídeo", "Status", "Ações"]}
          >
            {data?.map((item) => {
              const youtubeId = extractYouTubeId(item.youtube_url);

              return (
                <tr
                  key={item.id}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="px-4 py-3">
                    <ReorderButtons action={moveVideo} id={item.id} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {youtubeId ? (
                        <Image
                          src={`https://i.ytimg.com/vi/${youtubeId}/default.jpg`}
                          alt=""
                          width={56}
                          height={40}
                          sizes="56px"
                          className="h-10 w-14 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="h-10 w-14 shrink-0 rounded-xl bg-muted" />
                      )}
                      <span className="font-medium">{item.title_pt}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusLabel status={item.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <AdminEditLink href={`/admin/videos/${item.id}`} />
                      <ConfirmDeleteButton
                        iconOnly
                        action={deleteVideo}
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
