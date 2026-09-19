import { StarIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import { formatEventDisplay } from "@/lib/event-time";
import type { PublicEvent } from "@/lib/public/events";
import { cn } from "@/lib/utils";

type EventRowsProps = {
  events: PublicEvent[];
  locale: string;
  /** Shows a ticket button with this label beside the time when the event has a ticket URL. */
  ticketsLabel?: string;
  /**
   * Shows a star beside the name of featured concerts, with this as its
   * accessible name. Left out (as on the home page) means no star.
   */
  featuredLabel?: string;
  showCountry?: boolean;
};

/**
 * Concert rows shared by the schedule pages and the home page: the name and
 * venue on one end and the date on the other. From tablet up the event image
 * sits right beside the date, and the date column has a fixed width (wide
 * enough for the longest date in any language, "20 de novembro 2026": about
 * 385px on desktop, 298px on tablets) so the images line up from row to row.
 * On phones the image goes above the name.
 *
 * The date is stacked: day and month large with the year small beside them,
 * and the time just below (with the ticket button next to it), all in the
 * visitor's language. On phones the date, year and time share one line with
 * the ticket button under it, all smaller than the concert name so the name
 * leads.
 */
export function EventRows({
  events,
  locale,
  ticketsLabel,
  featuredLabel,
  showCountry = false,
}: EventRowsProps) {
  return (
    <ul className="divide-y divide-border/70">
      {events.map((event) => {
        const { dayMonth, year, time } = formatEventDisplay(
          event.localDate,
          event.localTime,
          locale,
        );

        return (
          <li
            key={event.id}
            className={cn(
              "grid gap-4 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-x-8 sm:py-8",
              event.imageUrl &&
                "md:grid-cols-[minmax(0,1fr)_9rem_19.5rem] md:gap-x-6 lg:grid-cols-[minmax(0,1fr)_13rem_25rem]",
            )}
          >
            <div className="min-w-0">
              <h3 className="font-heading text-2xl tracking-tight sm:text-3xl">
                {event.title}
                {featuredLabel && event.isFeatured ? (
                  <StarIcon
                    weight="fill"
                    role="img"
                    aria-label={featuredLabel}
                    className="ml-2 inline-block size-5 -translate-y-0.5 text-amber-400 sm:size-6"
                  />
                ) : null}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
                {event.venue} · {event.city}
                {showCountry ? `, ${event.country}` : null}
              </p>
            </div>

            {event.imageUrl ? (
              <div className="relative order-first aspect-[16/10] overflow-hidden bg-muted sm:col-span-2 md:order-none md:col-span-1 md:aspect-[4/3]">
                <Image
                  src={event.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 144px, 208px"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-3 font-heading sm:flex-col sm:items-end sm:gap-y-2">
              <p className="leading-none tracking-tight sm:text-right sm:whitespace-nowrap">
                <time
                  dateTime={event.localDate}
                  className="text-lg sm:text-4xl lg:text-5xl"
                >
                  {dayMonth}
                </time>
                {year ? (
                  <span className="ml-2 text-sm text-muted-foreground sm:text-lg">
                    {year}
                  </span>
                ) : null}
              </p>
              <span
                aria-hidden="true"
                className="text-muted-foreground sm:hidden"
              >
                ·
              </span>
              {/* Phones: time and button are loose items of the row above (the
                  button wraps to its own line). From `sm` up they form their
                  own row under the date, so the column is only as wide as the
                  date and the image can sit right beside it. */}
              <div className="contents sm:flex sm:flex-row-reverse sm:items-center sm:gap-4">
                <p className="text-lg tabular-nums sm:text-3xl">
                  <time dateTime={event.localTime}>{time}</time>
                </p>
                {ticketsLabel && event.ticketUrl ? (
                  <div className="basis-full sm:basis-auto">
                    <a
                      href={event.ticketUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${ticketsLabel}: ${event.title}`}
                      className="inline-flex h-8 items-center bg-primary px-3 font-sans text-xs font-medium tracking-wider text-primary-foreground uppercase transition-colors hover:bg-primary/85 sm:h-9 sm:px-4 sm:text-sm"
                    >
                      {ticketsLabel}
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
