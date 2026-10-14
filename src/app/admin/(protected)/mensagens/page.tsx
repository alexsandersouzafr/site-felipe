import { deleteMessage } from "@/app/admin/(protected)/mensagens/actions";
import {
  AdminTabLinks,
  AdminViewLink,
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
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pasta?: string }>;
}) {
  const { page: pageParam, pasta } = await searchParams;
  const isSpamFolder = pasta === "spam";
  const page = parsePage(pageParam);
  const supabase = await createClient();

  const [{ count: inboxCount }, { count: spamCount }] = await Promise.all([
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("is_spam", false),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("is_spam", true),
  ]);

  const totalCount = (isSpamFolder ? spamCount : inboxCount) ?? 0;
  const totalPages = pageCount(totalCount, ADMIN_PAGE_SIZE);
  const safePage = clampPage(page, totalPages);
  const { from, to } = pageRange(safePage, ADMIN_PAGE_SIZE);

  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, created_at, is_read")
    .eq("is_spam", isSpamFolder)
    .order("created_at", { ascending: false })
    .range(from, to);

  return (
    <AdminListPage>
      <AdminPageHeader
        title="Mensagens"
        description="Mensagens enviadas pelo formulário de contato do site. As que parecem propaganda ou golpe vão direto para o Spam — confira de vez em quando, e devolva à caixa de entrada o que for de verdade."
      />
      <AdminListPanel
        filters={
          <AdminTabLinks
            label="Pasta de mensagens"
            items={[
              {
                href: "/admin/mensagens",
                label: `Caixa de entrada (${inboxCount ?? 0})`,
                active: !isSpamFolder,
              },
              {
                href: "/admin/mensagens?pasta=spam",
                label: `Spam (${spamCount ?? 0})`,
                active: isSpamFolder,
              },
            ]}
          />
        }
        pagination={{
          basePath: "/admin/mensagens",
          page: safePage,
          totalPages,
          extraParams: isSpamFolder ? { pasta: "spam" } : undefined,
        }}
      >
        {error && (
          <p className="text-sm text-destructive">
            Não foi possível carregar as mensagens.
          </p>
        )}
        {!error && (data?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">
            {isSpamFolder
              ? "Nenhuma mensagem no spam."
              : "Nenhuma mensagem recebida ainda."}
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
                  <div className="flex justify-end gap-1">
                    <AdminViewLink href={`/admin/mensagens/${item.id}`} />
                    <ConfirmDeleteButton
                      action={deleteMessage}
                      id={item.id}
                      iconOnly
                      label="Apagar"
                      message="Apagar esta mensagem? Não dá para desfazer."
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
