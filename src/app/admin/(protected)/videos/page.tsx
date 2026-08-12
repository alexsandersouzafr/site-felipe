import { deleteVideo } from "@/app/admin/(protected)/fotos/actions";
import {
  AdminCreateLink,
  AdminEditLink,
} from "@/components/admin/admin-action-links";
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-list";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { createClient } from "@/lib/supabase/server";

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
        description="Cadastre vídeos hospedados no YouTube com título, descrição e ordem de exibição. Publique, agende ou mantenha em rascunho até estarem prontos."
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
        <AdminDataTable headers={["Título", "YouTube", "Status", "Ações"]}>
          {data?.map((item) => (
            <tr
              key={item.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className="px-4 py-3 font-medium">{item.title_pt}</td>
              <td className="max-w-xs truncate px-4 py-3">
                {item.youtube_url}
              </td>
              <td className="px-4 py-3">{item.status}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <AdminEditLink href={`/admin/videos/${item.id}`} />
                  <ConfirmDeleteButton action={deleteVideo} id={item.id} />
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}
    </div>
  );
}
