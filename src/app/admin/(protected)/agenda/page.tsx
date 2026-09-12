import { StarIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { toggleEventFeatured } from "@/app/admin/(protected)/agenda/actions";
import {
  AdminCreateLink,
  AdminEditLink,
} from "@/components/admin/admin-action-links";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { AdminPaginationNav } from "@/components/admin/pagination-nav";
import { Button } from "@/components/ui/button";
import { getEventLocalDateTime } from "@/lib/event-time";
import type { EventRecord } from "@/lib/events";
import { mediaPublicUrl } from "@/lib/media-url";
import {
  ADMIN_PAGE_SIZE,
  clampPage,
  pageCount,
  pageRange,
  parsePage,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const statusLabel = {
  draft: "Rascunho",
  scheduled: "Agendado",
  published: "Publicado",
} as const;

export default async function AdminAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>;
}) {
  const { filter, page: pageParam } = await searchParams;
  const onlyFeatured = filter === "favoritos";
  const page = parsePage(pageParam);

  const supabase = await createClient();

  let countQuery = supabase
    .from("events")
    .select("id", { count: "exact", head: true });
  if (onlyFeatured) {
    countQuery = countQuery.eq("is_featured", true);
  }
  const { count: totalCount } = await countQuery;
  const totalPages = pageCount(totalCount ?? 0, ADMIN_PAGE_SIZE);
  const safePage = clampPage(page, totalPages);
  const { from, to } = pageRange(safePage, ADMIN_PAGE_SIZE);

  let query = supabase
    .from("events")
    .select("*", { count: "exact" })
    .order("starts_at", { ascending: false });

  if (onlyFeatured) {
    query = query.eq("is_featured", true);
  }

  const { data, error } = await query.range(from, to);

  const events = (data ?? []) as EventRecord[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl tracking-tight">Agenda</h1>
          <p className="max-w-2xl text-muted-foreground">
            Crie, edite, agende e publique concertos e compromissos. Informe
            local, cidade e o fuso horário do evento para que a data pública
            apareça corretamente para o público. Favorite os eventos que devem
            aparecer na home.
          </p>
        </div>
        <AdminCreateLink href="/admin/agenda/nova">Novo evento</AdminCreateLink>
      </div>

      <nav
        className="inline-flex rounded-2xl border border-border/80 p-1 text-sm"
        aria-label="Filtrar eventos"
      >
        <Link
          href="/admin/agenda"
          className={cn(
            "rounded-xl px-3 py-1.5 transition-colors",
            !onlyFeatured
              ? "bg-muted font-medium"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Todos
        </Link>
        <Link
          href="/admin/agenda?filter=favoritos"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-colors",
            onlyFeatured
              ? "bg-muted font-medium"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <StarIcon className="size-3.5" weight={onlyFeatured ? "fill" : "regular"} />
          Favoritos
        </Link>
      </nav>

      {error && (
        <p className="text-sm text-destructive">
          Não foi possível carregar os eventos. Verifique se as migrations foram
          aplicadas.
        </p>
      )}

      {!error && events.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {onlyFeatured
            ? "Nenhum evento favoritado ainda."
            : "Nenhum evento cadastrado ainda."}
        </p>
      )}

      {events.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-border/80">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-border/80 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium" aria-label="Favorito" />
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
                      <form action={toggleEventFeatured}>
                        <input type="hidden" name="id" value={event.id} />
                        <input
                          type="hidden"
                          name="isFeatured"
                          value={String(event.is_featured)}
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={
                            event.is_featured
                              ? "Remover dos favoritos"
                              : "Adicionar aos favoritos"
                          }
                        >
                          <StarIcon
                            className={cn(
                              "size-4",
                              event.is_featured
                                ? "text-amber-500"
                                : "text-muted-foreground",
                            )}
                            weight={event.is_featured ? "fill" : "regular"}
                          />
                        </Button>
                      </form>
                    </td>
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

      <AdminPaginationNav
        basePath="/admin/agenda"
        page={safePage}
        totalPages={totalPages}
        extraParams={onlyFeatured ? { filter: "favoritos" } : {}}
      />
    </div>
  );
}
