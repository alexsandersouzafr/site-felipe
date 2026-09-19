import { StarIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import { toggleEventFeatured } from "@/app/admin/(protected)/agenda/actions";
import {
  AdminCreateLink,
  AdminEditLink,
  AdminFilterLink,
} from "@/components/admin/admin-action-links";
import {
  AdminDataTable,
  AdminListPage,
  AdminListPanel,
  AdminPageHeader,
} from "@/components/admin/admin-list";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { FeaturedToggleButton } from "@/components/admin/featured-toggle-button";
import { StatusLabel } from "@/components/admin/status-label";
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
    <AdminListPage>
      <AdminPageHeader
        title="Agenda"
        description="Crie, edite, agende e publique concertos e compromissos. Informe local, cidade e o fuso horário do evento para que a data pública apareça corretamente para o público. Favorite os eventos que devem aparecer na home."
      />

      <AdminListPanel
        filters={
          <AdminFilterLink
            href={
              onlyFeatured ? "/admin/agenda" : "/admin/agenda?filter=favoritos"
            }
            active={onlyFeatured}
            icon={
              <StarIcon
                className="size-4"
                weight={onlyFeatured ? "fill" : "regular"}
              />
            }
          >
            Favoritos
          </AdminFilterLink>
        }
        actions={
          <AdminCreateLink href="/admin/agenda/nova">
            Novo evento
          </AdminCreateLink>
        }
        pagination={{
          basePath: "/admin/agenda",
          page: safePage,
          totalPages,
          extraParams: onlyFeatured ? { filter: "favoritos" } : {},
        }}
      >
        {error && (
          <p className="text-sm text-destructive">
            Não foi possível carregar os eventos. Verifique se as migrations
            foram aplicadas.
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
          <AdminDataTable
            headers={[
              { label: "Favorito", hideLabel: true },
              "Evento",
              "Local",
              "Data",
              "Status",
              "Ações",
            ]}
          >
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
                      <FeaturedToggleButton isFeatured={event.is_featured} />
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {mediaPublicUrl(event.image_path) ? (
                        <Image
                          src={mediaPublicUrl(event.image_path) as string}
                          alt=""
                          width={40}
                          height={40}
                          sizes="40px"
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
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {local.date} {local.time}
                  </td>
                  <td className="px-4 py-3">
                    <StatusLabel status={event.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <AdminEditLink href={`/admin/agenda/${event.id}`} />
                      <DeleteEventButton id={event.id} iconOnly />
                    </div>
                  </td>
                </tr>
              );
            })}
          </AdminDataTable>
        )}
      </AdminListPanel>
    </AdminListPage>
  );
}
