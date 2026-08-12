import { describe, expect, it } from "vitest";

import { getEventLocalDateTime } from "./event-time";

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
