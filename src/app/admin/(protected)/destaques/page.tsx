import {
  deleteHighlight,
  moveHighlight,
} from "@/app/admin/(protected)/editorial/actions";
import {
  AdminCreateLink,
  AdminEditLink,
} from "@/components/admin/admin-action-links";
import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-list";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { AdminPaginationNav } from "@/components/admin/pagination-nav";
import { ReorderButtons } from "@/components/admin/reorder-buttons";
import { MAX_BIO_PAGE_HIGHLIGHTS } from "@/lib/bio-page";
import {
  ADMIN_PAGE_SIZE,
  clampPage,
  pageCount,
  pageRange,
  parsePage,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHighlightsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = parsePage((await searchParams).page);
  const supabase = await createClient();

  const { count: totalCount } = await supabase
    .from("highlights")
    .select("id", { count: "exact", head: true });
  const totalPages = pageCount(totalCount ?? 0, ADMIN_PAGE_SIZE);
  const safePage = clampPage(page, totalPages);
  const { from, to } = pageRange(safePage, ADMIN_PAGE_SIZE);
  const pageOffset = (safePage - 1) * ADMIN_PAGE_SIZE;

  const { data, error } = await supabase
    .from("highlights")
    .select("id, title_pt, status, display_order, show_on_page")
    .order("display_order", { ascending: true })
    .range(from, to);

  const { count: onPageCount } = await supabase
    .from("highlights")
    .select("id", { count: "exact", head: true })
    .eq("show_on_page", true);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Destaques"
        description={`Cadastre conquistas e highlights curtos para a página de biografia. Marque Exibir na página em até ${MAX_BIO_PAGE_HIGHLIGHTS} itens; use as setas para reordenar. Em uso: ${onPageCount ?? 0}/${MAX_BIO_PAGE_HIGHLIGHTS}.`}
        action={
          <AdminCreateLink href="/admin/destaques/nova">
            Novo destaque
          </AdminCreateLink>
        }
      />
      {error && (
        <p className="text-sm text-destructive">
          Não foi possível carregar os destaques.
        </p>
      )}
      {!error && (data?.length ?? 0) === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum destaque ainda.</p>
      )}
      {(data?.length ?? 0) > 0 && (
        <AdminDataTable
          headers={["Mover", "Título", "Status", "Página", "Ações"]}
        >
          {data?.map((item, index) => (
            <tr
              key={item.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className="px-4 py-3">
                <ReorderButtons
                  action={moveHighlight}
                  id={item.id}
                  disabledUp={pageOffset + index === 0}
                  disabledDown={pageOffset + index === (totalCount ?? 0) - 1}
                />
              </td>
              <td className="px-4 py-3 font-medium">{item.title_pt}</td>
              <td className="px-4 py-3">{item.status}</td>
              <td className="px-4 py-3">
                {item.show_on_page ? "Na página" : "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <AdminEditLink href={`/admin/destaques/${item.id}`} />
                  <ConfirmDeleteButton action={deleteHighlight} id={item.id} />
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}

      <AdminPaginationNav basePath="/admin/destaques" page={safePage} totalPages={totalPages} />
    </div>
  );
}
