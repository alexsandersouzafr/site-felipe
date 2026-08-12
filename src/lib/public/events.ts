import type { Locale } from "@/i18n/routing";
import { getEventLocalDateTime } from "@/lib/event-time";
import { getLocalizedValue } from "@/lib/localized-value";
import { mediaPublicUrl } from "@/lib/media-url";
import { partitionEventsByTime } from "@/lib/public/schedule";
import { createClient } from "@/lib/supabase/server";

type EventRow = {
  id: string;
  title_pt: string;
  title_en: string | null;
  title_es: string | null;
  venue: string;
  city: string;
  country: string;
  time_zone: string;
  starts_at: string;
  ends_at: string | null;
  ticket_url: string | null;
  image_path: string | null;
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
};

function toPublicEvent(row: EventRow, locale: Locale): PublicEvent {
  const local = getEventLocalDateTime(row.starts_at, row.time_zone);

  return {
    id: row.id,
    title: getLocalizedValue(
      { pt: row.title_pt, en: row.title_en, es: row.title_es },
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
  };
}

async function fetchVisibleEvents() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title_pt, title_en, title_es, venue, city, country, time_zone, starts_at, ends_at, ticket_url, image_path",
    )
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
  return upcoming.slice(0, limit);
}
