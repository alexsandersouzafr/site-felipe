import { getLocale, getTranslations } from "next-intl/server";

import { EventRows } from "@/components/public/event-rows";
import type { PublicEvent } from "@/lib/public/events";

type EventListProps = {
  events: PublicEvent[];
  emptyLabel: string;
  /** Ticket buttons make no sense for concerts that already happened. */
  showTickets?: boolean;
};

export async function EventList({
  events,
  emptyLabel,
  showTickets = true,
}: EventListProps) {
  const t = await getTranslations("Schedule");
  const locale = await getLocale();

  if (events.length === 0) {
    return <p className="text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <EventRows
      events={events}
      locale={locale}
      ticketsLabel={showTickets ? t("tickets") : undefined}
      featuredLabel={t("featured")}
      showCountry
    />
  );
}
