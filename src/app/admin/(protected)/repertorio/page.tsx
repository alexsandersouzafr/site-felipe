import { deleteRepertoireWork } from "@/app/admin/(protected)/repertorio/actions";
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
import {
  ADMIN_PAGE_SIZE,
  clampPage,
  pageCount,
  pageRange,
  parsePage,
} from "@/lib/pagination";
import { isRepertoireGenre, REPERTOIRE_GENRE_LABELS } from "@/lib/repertoire";
import { createClient } from "@/lib/supabase/server";

export default async function AdminRepertoirePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = parsePage((await searchParams).page);
  const supabase = await createClient();

  const { count: totalCount } = await supabase
    .from("repertoire_works")
    .select("id", { count: "exact", head: true });
  const totalPages = pageCount(totalCount ?? 0, ADMIN_PAGE_SIZE);
  const safePage = clampPage(page, totalPages);
  const { from, to } = pageRange(safePage, ADMIN_PAGE_SIZE);

  // The order the public page reads in: column, then composer, then work.
  const { data, error } = await supabase
    .from("repertoire_works")
    .select("id, title, composer, genre")
    .order("genre", { ascending: true })
    .order("composer", { ascending: true })
    .order("title", { ascending: true })
    .range(from, to);

  return (
    <AdminListPage>
      <AdminPageHeader
        title="Repertório"
        description="Obras que o maestro rege. Na página pública elas aparecem em duas colunas, Erudito e Popular, agrupadas por compositor e em ordem alfabética."
      />
      <AdminListPanel
        actions={
          <AdminCreateLink href="/admin/repertorio/nova">
            {" "}
            Nova obra{" "}
          </AdminCreateLink>
        }
        pagination={{
          basePath: "/admin/repertorio",
          page: safePage,
          totalPages,
        }}
      >
        {error && (
          <p className="text-sm text-destructive">
            Não foi possível carregar o repertório.
          </p>
        )}
        {!error && (data?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma obra cadastrada ainda.
          </p>
        )}
        {(data?.length ?? 0) > 0 && (
          <AdminDataTable headers={["Obra", "Compositor", "Gênero", "Ações"]}>
            {data?.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border/60 last:border-0"
              >
                <td className="px-4 py-3 font-medium">{item.title}</td>
                <td className="px-4 py-3">{item.composer}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {isRepertoireGenre(item.genre)
                    ? REPERTOIRE_GENRE_LABELS[item.genre]
                    : item.genre}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <AdminEditLink href={`/admin/repertorio/${item.id}`} />
                    <ConfirmDeleteButton
                      iconOnly
                      action={deleteRepertoireWork}
                      id={item.id}
                      message={`Excluir "${item.title}" do repertório? Esta ação não pode ser desfeita.`}
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
