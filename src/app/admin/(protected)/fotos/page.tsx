import { deletePhoto } from "@/app/admin/(protected)/fotos/actions";
import {
  AdminCreateLink,
  AdminEditLink,
} from "@/components/admin/admin-action-links";
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-list";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
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
        description="Envie imagens para o armazenamento do site, defina texto alternativo, crédito e coleção, e controle a ordem e a publicação na galeria pública."
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
          headers={["Alt", "Coleção", "Ordem", "Status", "Ações"]}
        >
          {data?.map((item) => (
            <tr
              key={item.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className="px-4 py-3 font-medium">{item.alt_pt}</td>
              <td className="px-4 py-3">{item.collection ?? "—"}</td>
              <td className="px-4 py-3">{item.display_order}</td>
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
