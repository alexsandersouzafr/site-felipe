import { deleteVideo, moveVideo } from "@/app/admin/(protected)/fotos/actions";
import {
  AdminCreateLink,
  AdminEditLink,
} from "@/components/admin/admin-action-links";
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-list";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ReorderButtons } from "@/components/admin/reorder-buttons";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId } from "@/lib/youtube";

export default async function AdminVideosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id, title_pt, youtube_url, status, display_order")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Vídeos"
        description="Cadastre vídeos hospedados no YouTube com título e descrição, e use as setas para reordenar. Publique, agende ou mantenha em rascunho até estarem prontos."
        action={
          <AdminCreateLink href="/admin/videos/nova">
            Novo vídeo
          </AdminCreateLink>
        }
      />
      {error && (
        <p className="text-sm text-destructive">
          Não foi possível carregar os vídeos.
        </p>
      )}
      {!error && (data?.length ?? 0) === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum vídeo ainda.</p>
      )}
      {(data?.length ?? 0) > 0 && (
        <AdminDataTable headers={["Mover", "Vídeo", "Status", "Ações"]}>
          {data?.map((item, index) => {
            const youtubeId = extractYouTubeId(item.youtube_url);

            return (
              <tr
                key={item.id}
                className="border-b border-border/60 last:border-0"
              >
                <td className="px-4 py-3">
                  <ReorderButtons
                    action={moveVideo}
                    id={item.id}
                    disabledUp={index === 0}
                    disabledDown={index === (data?.length ?? 0) - 1}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {youtubeId ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://img.youtube.com/vi/${youtubeId}/default.jpg`}
                        alt=""
                        className="h-10 w-14 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="h-10 w-14 shrink-0 rounded-xl bg-muted" />
                    )}
                    <span className="font-medium">{item.title_pt}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <AdminEditLink href={`/admin/videos/${item.id}`} />
                    <ConfirmDeleteButton action={deleteVideo} id={item.id} />
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminDataTable>
      )}
    </div>
  );
}
