import { deleteBiography } from "@/app/admin/(protected)/editorial/actions";
import {
  AdminCreateLink,
  AdminEditLink,
} from "@/components/admin/admin-action-links";
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-list";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { SetBiographyOnPageButton } from "@/components/admin/set-biography-on-page-button";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBioPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("biographies")
    .select("id, title_pt, status, show_on_page, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Biografia"
        description="Mantenha uma ou mais versões da biografia com texto rico. Só uma pode aparecer no site: marque Exibir na página ou use Usar nesta página na lista."
        action={
          <AdminCreateLink href="/admin/bio/nova">
            Nova biografia
          </AdminCreateLink>
        }
      />
      {error && (
        <p className="text-sm text-destructive">
          Não foi possível carregar as biografias.
        </p>
      )}
      {!error && (data?.length ?? 0) === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhuma biografia ainda.
        </p>
      )}
      {(data?.length ?? 0) > 0 && (
        <AdminDataTable headers={["Título", "Status", "Página", "Ações"]}>
          {data?.map((item) => (
            <tr
              key={item.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className="px-4 py-3 font-medium">{item.title_pt}</td>
              <td className="px-4 py-3">{item.status}</td>
              <td className="px-4 py-3">
                <SetBiographyOnPageButton
                  id={item.id}
                  isOnPage={item.show_on_page}
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <AdminEditLink href={`/admin/bio/${item.id}`} />
                  <ConfirmDeleteButton action={deleteBiography} id={item.id} />
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}
    </div>
  );
}
