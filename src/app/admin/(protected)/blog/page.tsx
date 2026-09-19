import Image from "next/image";

import { deleteBlogPost } from "@/app/admin/(protected)/blog/actions";
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

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = parsePage((await searchParams).page);
  const supabase = await createClient();

  const { count: totalCount } = await supabase
    .from("news_items")
    .select("id", { count: "exact", head: true });
  const totalPages = pageCount(totalCount ?? 0, ADMIN_PAGE_SIZE);
  const safePage = clampPage(page, totalPages);
  const { from, to } = pageRange(safePage, ADMIN_PAGE_SIZE);

  const { data, error } = await supabase
    .from("news_items")
    .select("id, title_pt, slug, status, created_at, cover_image_path")
    .order("created_at", { ascending: false })
    .range(from, to);

  return (
    <AdminListPage>
      <AdminPageHeader
        title="Blog"
        description="Publique postagens montadas com blocos de parágrafo, imagem e vídeo do YouTube. Defina a capa por upload ou pela galeria de fotos, com português obrigatório e traduções opcionais."
      />
      <AdminListPanel
        actions={
          <AdminCreateLink href="/admin/blog/nova">Novo post</AdminCreateLink>
        }
        pagination={{ basePath: "/admin/blog", page: safePage, totalPages }}
      >
        {error && (
          <p className="text-sm text-destructive">
            Não foi possível carregar os posts do blog.
          </p>
        )}
        {!error && (data?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum post ainda.</p>
        )}
        {(data?.length ?? 0) > 0 && (
          <AdminDataTable headers={["Post", "Slug", "Status", "Ações"]}>
            {data?.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border/60 last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {mediaPublicUrl(item.cover_image_path) ? (
                      <Image
                        src={mediaPublicUrl(item.cover_image_path) as string}
                        alt=""
                        width={40}
                        height={40}
                        sizes="40px"
                        className="size-10 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="size-10 shrink-0 rounded-xl bg-muted" />
                    )}
                    <span className="font-medium">{item.title_pt}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{item.slug}</td>
                <td className="px-4 py-3">
                  <StatusLabel status={item.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <AdminEditLink href={`/admin/blog/${item.id}`} />
                    <ConfirmDeleteButton
                      iconOnly
                      action={deleteBlogPost}
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
