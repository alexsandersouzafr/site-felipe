import { deleteBlogPost } from "@/app/admin/(protected)/blog/actions";
import {
  AdminCreateLink,
  AdminEditLink,
} from "@/components/admin/admin-action-links";
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-list";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_items")
    .select("id, title_pt, slug, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Blog"
        description="Publique postagens montadas com blocos de parágrafo, imagem e vídeo do YouTube. Defina a capa por upload ou pela galeria de fotos, com português obrigatório e traduções opcionais."
        action={
          <AdminCreateLink href="/admin/blog/nova">Novo post</AdminCreateLink>
        }
      />
      {error && (
        <p className="text-sm text-destructive">
          Não foi possível carregar os posts do blog.
        </p>
      )}
      {!error && (data?.length ?? 0) === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum post ainda.</p>
      )}
      {(data?.length ?? 0) > 0 && (
        <AdminDataTable headers={["Título", "Slug", "Status", "Ações"]}>
          {data?.map((item) => (
            <tr
              key={item.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className="px-4 py-3 font-medium">{item.title_pt}</td>
              <td className="px-4 py-3">{item.slug}</td>
              <td className="px-4 py-3">{item.status}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <AdminEditLink href={`/admin/blog/${item.id}`} />
                  <ConfirmDeleteButton action={deleteBlogPost} id={item.id} />
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}
    </div>
  );
}
