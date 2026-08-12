import { describe, expect, it } from "vitest";

import { eventFormSchema } from "./event-form";

describe("eventFormSchema", () => {
  it("requires Portuguese title and core schedule fields", () => {
    const result = eventFormSchema.safeParse({
      status: "draft",
      publishAt: "",
      titlePt: "",
      titleEn: "",
      titleEs: "",
      venue: "Sala São Paulo",
      city: "São Paulo",
      country: "Brasil",
      timeZone: "America/Sao_Paulo",
      startsAtLocal: "2026-08-20T20:00",
      endsAtLocal: "",
      ticketUrl: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid draft event", () => {
    const result = eventFormSchema.safeParse({
      status: "draft",
      publishAt: "",
      titlePt: "Noite de Mahler",
      titleEn: "",
      titleEs: "",
      venue: "Sala São Paulo",
      city: "São Paulo",
      country: "Brasil",
      timeZone: "America/Sao_Paulo",
      startsAtLocal: "2026-08-20T20:00",
      endsAtLocal: "",
      ticketUrl: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.titleEn).toBeNull();
      expect(result.data.publishAt).toBeNull();
    }
  });
});
