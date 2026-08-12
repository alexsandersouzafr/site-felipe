import { describe, expect, it } from "vitest";

import {
  localDateTimeInZoneToUtc,
  utcToLocalDateTimeInput,
} from "./event-timezone";

describe("event timezone helpers", () => {
  it("round-trips a Sao Paulo concert time", () => {
    const utc = localDateTimeInZoneToUtc(
      "2026-08-20T20:00",
      "America/Sao_Paulo",
    );

    expect(utc).toBe("2026-08-20T23:00:00.000Z");
    expect(utcToLocalDateTimeInput(utc, "America/Sao_Paulo")).toBe(
      "2026-08-20T20:00",
    );
  });
});
