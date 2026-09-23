import { describe, expect, it } from "vitest";

import {
  isSupportedTimeZone,
  isValidLocalDateTime,
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
    expect(utcToLocalDateTimeInput(utc ?? "", "America/Sao_Paulo")).toBe(
      "2026-08-20T20:00",
    );
  });

  // Anything below used to throw a RangeError inside the server action, which
  // the admin saw as Next's error screen instead of a message on the form.
  it.each([
    ["empty", ""],
    ["not a date", "qualquer coisa"],
    ["date without time", "2026-08-20"],
    ["month 13", "2026-13-01T10:00"],
    ["February 31st", "2026-02-31T10:00"],
    ["hour 25", "2026-08-20T25:00"],
  ])("refuses %s instead of throwing", (_label, value) => {
    expect(isValidLocalDateTime(value)).toBe(false);
    expect(localDateTimeInZoneToUtc(value, "America/Sao_Paulo")).toBeNull();
  });

  it("refuses an unknown time zone", () => {
    expect(isSupportedTimeZone("Mars/Olympus")).toBe(false);
    expect(localDateTimeInZoneToUtc("2026-08-20T20:00", "")).toBeNull();
    expect(
      localDateTimeInZoneToUtc("2026-08-20T20:00", "Mars/Olympus"),
    ).toBeNull();
  });

  it("still renders the input when the stored row is unusable", () => {
    expect(utcToLocalDateTimeInput("not a date", "America/Sao_Paulo")).toBe("");
    expect(utcToLocalDateTimeInput("2026-08-20T23:00:00.000Z", "")).toBe(
      "2026-08-20T23:00",
    );
  });

  it("accepts seconds, which some browsers send", () => {
    expect(isValidLocalDateTime("2026-08-20T20:00:00")).toBe(true);
  });
});
