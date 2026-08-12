import { z } from "zod";

import { toNullableLocalizedText } from "@/lib/localized-fields";
import { publishingFieldsSchema } from "@/lib/publishing";

export const eventFormSchema = publishingFieldsSchema
  .extend({
    titlePt: z.string().trim().min(1, "Informe o título em português."),
    titleEn: z.string().optional(),
    titleEs: z.string().optional(),
    venue: z.string().trim().min(1, "Informe o local."),
    city: z.string().trim().min(1, "Informe a cidade."),
    country: z.string().trim().min(1, "Informe o país."),
    timeZone: z.string().trim().min(1, "Informe o fuso horário."),
    startsAtLocal: z.string().trim().min(1, "Informe a data/hora de início."),
    endsAtLocal: z.string().optional(),
    ticketUrl: z.string().optional(),
    imagePath: z.string().optional(),
  })
  .transform((value) => {
    const titles = toNullableLocalizedText({
      pt: value.titlePt,
      en: value.titleEn,
      es: value.titleEs,
    });

    return {
      status: value.status,
      publishAt: value.publishAt?.trim() ? value.publishAt.trim() : null,
      titlePt: titles.pt,
      titleEn: titles.en,
      titleEs: titles.es,
      venue: value.venue,
      city: value.city,
      country: value.country,
      timeZone: value.timeZone,
      startsAtLocal: value.startsAtLocal,
      endsAtLocal: value.endsAtLocal?.trim() ? value.endsAtLocal.trim() : null,
      ticketUrl: value.ticketUrl?.trim() ? value.ticketUrl.trim() : null,
      imagePath: value.imagePath?.trim() ? value.imagePath.trim() : null,
    };
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const COMMON_TIME_ZONES = [
  "America/Sao_Paulo",
  "America/Manaus",
  "America/Fortaleza",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Lisbon",
  "UTC",
] as const;
