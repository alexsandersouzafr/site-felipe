import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import type { PublicEvent } from "@/lib/public/events";

type EventListProps = {
  events: PublicEvent[];
  emptyLabel: string;
};

function formatEventDate(date: string, locale: string) {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) {
    return date;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export async function EventList({ events, emptyLabel }: EventListProps) {
  const t = await getTranslations("Schedule");
  const locale = await getLocale();

  if (events.length === 0) {
    return <p className="text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="divide-y divide-border/70">
      {events.map((event) => (
        <li
          key={event.id}
          className="grid gap-4 py-6 sm:grid-cols-[8rem_1fr_auto] sm:items-start"
        >
          <div className="text-sm tracking-wide text-muted-foreground uppercase">
            <p>{formatEventDate(event.localDate, locale)}</p>
            <p className="mt-1 tabular-nums">{event.localTime}</p>
          </div>

          <div className="min-w-0 space-y-2">
            <h3 className="font-heading text-xl tracking-tight sm:text-2xl">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {event.venue} · {event.city}, {event.country}
            </p>
            {event.ticketUrl ? (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-sm text-primary underline-offset-4 hover:underline"
              >
                {t("tickets")}
              </a>
            ) : null}
          </div>

          {event.imageUrl ? (
            <div className="relative hidden h-24 w-36 overflow-hidden bg-muted sm:block">
              <Image
                src={event.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="144px"
              />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
