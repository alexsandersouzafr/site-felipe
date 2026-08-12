import type { ContentStatus } from "@/lib/content-visibility";
import type { EventFormValues } from "@/lib/event-form";
import {
  localDateTimeInZoneToUtc,
  utcToLocalDateTimeInput,
} from "@/lib/event-timezone";
import { normalizePublishAt } from "@/lib/publishing";

export type EventRecord = {
  id: string;
  status: ContentStatus;
  publish_at: string | null;
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
  created_at: string;
  updated_at: string;
};

export function toEventInsert(values: EventFormValues) {
  return {
    status: values.status,
    publish_at: normalizePublishAt(values.status, values.publishAt),
    title_pt: values.titlePt,
    title_en: values.titleEn,
    title_es: values.titleEs,
    venue: values.venue,
    city: values.city,
    country: values.country,
    time_zone: values.timeZone,
    starts_at: localDateTimeInZoneToUtc(values.startsAtLocal, values.timeZone),
    ends_at: values.endsAtLocal
      ? localDateTimeInZoneToUtc(values.endsAtLocal, values.timeZone)
      : null,
    ticket_url: values.ticketUrl,
    updated_at: new Date().toISOString(),
  };
}

export function toEventFormValues(event: EventRecord): EventFormValues {
  return {
    status: event.status,
    publishAt: event.publish_at
      ? utcToLocalDateTimeInput(event.publish_at, event.time_zone)
      : null,
    titlePt: event.title_pt,
    titleEn: event.title_en,
    titleEs: event.title_es,
    venue: event.venue,
    city: event.city,
    country: event.country,
    timeZone: event.time_zone,
    startsAtLocal: utcToLocalDateTimeInput(event.starts_at, event.time_zone),
    endsAtLocal: event.ends_at
      ? utcToLocalDateTimeInput(event.ends_at, event.time_zone)
      : null,
    ticketUrl: event.ticket_url,
  };
}
