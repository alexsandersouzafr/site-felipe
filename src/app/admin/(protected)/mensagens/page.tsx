import { AdminViewLink } from "@/components/admin/admin-action-links";
import {
  AdminDataTable,
  AdminListPage,
  AdminListPanel,
  AdminPageHeader,
} from "@/components/admin/admin-list";
import {
  ADMIN_PAGE_SIZE,
  clampPage,
  pageCount,
  pageRange,
  parsePage,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = parsePage((await searchParams).page);
  const supabase = await createClient();

  const { count: totalCount } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true });
  const totalPages = pageCount(totalCount ?? 0, ADMIN_PAGE_SIZE);
  const safePage = clampPage(page, totalPages);
  const { from, to } = pageRange(safePage, ADMIN_PAGE_SIZE);

  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, created_at, is_read")
    .order("created_at", { ascending: false })
    .range(from, to);

  return (
    <AdminListPage>
      <AdminPageHeader
        title="Mensagens"
        description="Caixa de entrada somente leitura das mensagens enviadas pelo formulário público de contato. Use esta lista para acompanhar pedidos e responder fora do site."
      />
      <AdminListPanel
        pagination={{
          basePath: "/admin/mensagens",
          page: safePage,
          totalPages,
        }}
      >
        {error && (
          <p className="text-sm text-destructive">
            Não foi possível carregar as mensagens. Aplique a migration de
            contato.
          </p>
        )}
        {!error && (data?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma mensagem recebida ainda.
          </p>
        )}
        {(data?.length ?? 0) > 0 && (
          <AdminDataTable
            headers={[
              { label: "Status", hideLabel: true },
              "Nome",
              "E-mail",
              "Assunto",
              "Data",
              "Ações",
            ]}
          >
            {data?.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  "border-b border-border/60 last:border-0",
                  !item.is_read && "bg-primary/5",
                )}
              >
                <td className="px-4 py-3">
                  {!item.is_read ? (
                    <span
                      role="status"
                      className="inline-block size-2 rounded-full bg-primary"
                      aria-label="Não lida"
                    />
                  ) : null}
                </td>
                <td
                  className={cn(
                    "px-4 py-3",
                    !item.is_read ? "font-semibold" : "font-medium",
                  )}
                >
                  {item.name}
                </td>
                <td className="px-4 py-3">{item.email}</td>
                <td className="px-4 py-3">{item.subject}</td>
                <td className="px-4 py-3">
                  {new Date(item.created_at).toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <AdminViewLink href={`/admin/mensagens/${item.id}`} />
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
