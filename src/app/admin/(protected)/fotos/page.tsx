import { deletePhoto, movePhoto } from "@/app/admin/(protected)/fotos/actions";
import {
  AdminCreateLink,
  AdminEditLink,
} from "@/components/admin/admin-action-links";
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-list";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ReorderButtons } from "@/components/admin/reorder-buttons";
import { mediaPublicUrl } from "@/lib/media-url";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPhotosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("id, alt_pt, collection, status, display_order, storage_path")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Fotos"
        description="Envie imagens para a galeria pública do site, defina texto alternativo, crédito e coleção, e use as setas para reordenar."
        action={
          <AdminCreateLink href="/admin/fotos/nova">Nova foto</AdminCreateLink>
        }
      />
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
          headers={["Mover", "Foto", "Coleção", "Status", "Ações"]}
        >
          {data?.map((item, index) => (
            <tr
              key={item.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className="px-4 py-3">
                <ReorderButtons
                  action={movePhoto}
                  id={item.id}
                  disabledUp={index === 0}
                  disabledDown={index === (data?.length ?? 0) - 1}
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
              <td className="px-4 py-3">{item.collection ?? "—"}</td>
              <td className="px-4 py-3">{item.status}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <AdminEditLink href={`/admin/fotos/${item.id}`} />
                  <ConfirmDeleteButton action={deletePhoto} id={item.id} />
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}
    </div>
  );
}
