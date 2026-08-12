import Link from "next/link";

import { AdminDataTable, AdminPageHeader } from "@/components/admin/admin-list";
import { createClient } from "@/lib/supabase/server";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Mensagens"
        description="Caixa de entrada somente leitura das mensagens enviadas pelo formulário público de contato. Use esta lista para acompanhar pedidos e responder fora do site."
      />
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
          headers={["Nome", "E-mail", "Assunto", "Data", "Ações"]}
        >
          {data?.map((item) => (
            <tr
              key={item.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className="px-4 py-3 font-medium">{item.name}</td>
              <td className="px-4 py-3">{item.email}</td>
              <td className="px-4 py-3">{item.subject}</td>
              <td className="px-4 py-3">
                {new Date(item.created_at).toLocaleString("pt-BR")}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/mensagens/${item.id}`}
                  className="inline-flex h-7 items-center rounded-2xl border border-border px-3 text-sm hover:bg-muted"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      )}
    </div>
  );
}
