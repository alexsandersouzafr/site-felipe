import type { Locale } from "@/i18n/routing";
import { getEventLocalDateTime } from "@/lib/event-time";
import { getLocalizedValue } from "@/lib/localized-value";
import { mediaPublicUrl } from "@/lib/media-url";
import { clampPage, pageCount, pageRange } from "@/lib/pagination";
import { partitionEventsByTime } from "@/lib/public/schedule";
import { createClient } from "@/lib/supabase/server";

const EVENT_COLUMNS =
  "id, title_pt, title_en, title_fr, venue, city, country, time_zone, starts_at, ends_at, ticket_url, image_path, is_featured";

type EventRow = {
  id: string;
  title_pt: string;
  title_en: string | null;
  title_fr: string | null;
  venue: string;
  city: string;
  country: string;
  time_zone: string;
  starts_at: string;
  ends_at: string | null;
  ticket_url: string | null;
  image_path: string | null;
  is_featured: boolean;
};

export type PublicEvent = {
  id: string;
  title: string;
  venue: string;
  city: string;
  country: string;
  timeZone: string;
  startsAt: string;
  endsAt: string | null;
  ticketUrl: string | null;
  imageUrl: string | null;
  localDate: string;
  localTime: string;
  isFeatured: boolean;
};

function toPublicEvent(row: EventRow, locale: Locale): PublicEvent {
  const local = getEventLocalDateTime(row.starts_at, row.time_zone);

  return {
    id: row.id,
    title: getLocalizedValue(
      { pt: row.title_pt, en: row.title_en, fr: row.title_fr },
      locale,
    ),
    venue: row.venue,
    city: row.city,
    country: row.country,
    timeZone: row.time_zone,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    ticketUrl: row.ticket_url,
    imageUrl: mediaPublicUrl(row.image_path),
    localDate: local.date,
    localTime: local.time,
    isFeatured: row.is_featured,
  };
}

async function fetchVisibleEvents() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as EventRow[];
}

export async function listPublicEvents(locale: Locale) {
  const rows = await fetchVisibleEvents();
  const events = rows.map((row) => toPublicEvent(row, locale));
  return partitionEventsByTime(events);
}

export async function listUpcomingEvents(locale: Locale, limit = 3) {
  const { upcoming } = await listPublicEvents(locale);
  const featured = upcoming.filter((event) => event.isFeatured);
  return (featured.length > 0 ? featured : upcoming).slice(0, limit);
}

type EventsPageKind = "upcoming" | "past";

async function fetchEventsPage(
  locale: Locale,
  kind: EventsPageKind,
  page: number,
  pageSize: number,
) {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const countQuery = supabase
    .from("events")
    .select("id", { count: "exact", head: true });
  const { count } = await (kind === "upcoming"
    ? countQuery.gte("starts_at", nowIso)
    : countQuery.lt("starts_at", nowIso));

  const totalPages = pageCount(count ?? 0, pageSize);
  // Clamped here so the caller shows the page that was actually loaded.
  const safePage = clampPage(page, totalPages);
  const { from, to } = pageRange(safePage, pageSize);

  const listQuery = supabase.from("events").select(EVENT_COLUMNS);
  const { data, error } = await (kind === "upcoming"
    ? listQuery.gte("starts_at", nowIso).order("starts_at", { ascending: true })
    : listQuery.lt("starts_at", nowIso).order("starts_at", { ascending: false })
  ).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    events: ((data ?? []) as EventRow[]).map((row) =>
      toPublicEvent(row, locale),
    ),
    page: safePage,
    totalPages,
  };
}

/** Upcoming events, soonest first. */
export function listUpcomingEventsPage(
  locale: Locale,
  page: number,
  pageSize: number,
) {
  return fetchEventsPage(locale, "upcoming", page, pageSize);
}

/** Past events, most recent first. */
export function listPastEventsPage(
  locale: Locale,
  page: number,
  pageSize: number,
) {
  return fetchEventsPage(locale, "past", page, pageSize);
}
