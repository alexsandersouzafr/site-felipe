import { describe, expect, it } from "vitest";

import { formatEventDisplay, getEventLocalDateTime } from "./event-time";

describe("getEventLocalDateTime", () => {
  it("converts a UTC event timestamp into the venue's IANA timezone", () => {
    expect(
      getEventLocalDateTime("2026-08-11T23:00:00.000Z", "America/Sao_Paulo"),
    ).toEqual({
      date: "2026-08-11",
      time: "20:00",
    });
  });
});

describe("formatEventDisplay", () => {
  // Some ICU versions put a narrow no-break space before AM/PM.
  const plain = (value: string) => value.replace(/\s/g, " ");

  it("writes day and month in Portuguese order with a 24-hour clock", () => {
    const result = formatEventDisplay("2026-09-26", "17:00", "pt");

    expect(result.dayMonth).toBe("26 de setembro");
    expect(result.year).toBe("2026");
    expect(plain(result.time)).toBe("17:00");
  });

  it("puts the month first in English and uses AM/PM", () => {
    const result = formatEventDisplay("2026-09-26", "17:00", "en");

    expect(result.dayMonth).toBe("September 26");
    expect(result.year).toBe("2026");
    expect(plain(result.time)).toBe("5:00 PM");
  });

  it("uses French month names", () => {
    const result = formatEventDisplay("2026-09-26", "21:30", "fr");

    expect(result.dayMonth).toBe("26 septembre");
    expect(result.year).toBe("2026");
    expect(plain(result.time)).toBe("21:30");
  });

  it("does not move the date with the machine's timezone", () => {
    expect(formatEventDisplay("2026-01-01", "00:30", "pt").dayMonth).toBe(
      "1 de janeiro",
    );
    expect(formatEventDisplay("2026-12-31", "23:45", "pt").dayMonth).toBe(
      "31 de dezembro",
    );
  });

  it("falls back to the raw values when they cannot be parsed", () => {
    expect(formatEventDisplay("soon", "later", "pt")).toEqual({
      dayMonth: "soon",
      year: "",
      time: "later",
    });
  });
});
