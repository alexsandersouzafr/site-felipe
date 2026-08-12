import {
  AdminCreateLink,
  AdminEditLink,
} from "@/components/admin/admin-action-links";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { getEventLocalDateTime } from "@/lib/event-time";
import type { EventRecord } from "@/lib/events";
import { mediaPublicUrl } from "@/lib/media-url";
import { createClient } from "@/lib/supabase/server";

const statusLabel = {
  draft: "Rascunho",
  scheduled: "Agendado",
  published: "Publicado",
} as const;

export default async function AdminAgendaPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false });

  const events = (data ?? []) as EventRecord[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl tracking-tight">Agenda</h1>
          <p className="max-w-2xl text-muted-foreground">
            Crie, edite, agende e publique concertos e compromissos. Informe
            local, cidade e o fuso horário do evento para que a data pública
            apareça corretamente para o público.
          </p>
        </div>
        <AdminCreateLink href="/admin/agenda/nova">Novo evento</AdminCreateLink>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Não foi possível carregar os eventos. Verifique se as migrations foram
          aplicadas.
        </p>
      )}

      {!error && events.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhum evento cadastrado ainda.
        </p>
      )}

      {events.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-border/80">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-border/80 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Evento</th>
                <th className="px-4 py-3 font-medium">Local</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const local = getEventLocalDateTime(
                  event.starts_at,
                  event.time_zone,
                );

                return (
                  <tr
                    key={event.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {event.image_path ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaPublicUrl(event.image_path) ?? undefined}
                            alt=""
                            className="size-10 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <span className="size-10 shrink-0 rounded-xl bg-muted" />
                        )}
                        <span className="font-medium">{event.title_pt}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {event.venue} · {event.city}
                    </td>
                    <td className="px-4 py-3">
                      {local.date} {local.time}
                    </td>
                    <td className="px-4 py-3">{statusLabel[event.status]}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <AdminEditLink href={`/admin/agenda/${event.id}`} />
                        <DeleteEventButton id={event.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
