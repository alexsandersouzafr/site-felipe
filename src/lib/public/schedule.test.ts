import { describe, expect, it } from "vitest";

import { partitionEventsByTime } from "./schedule";

describe("partitionEventsByTime", () => {
  const now = new Date("2026-06-15T12:00:00.000Z");

  it("splits upcoming and past by startsAt", () => {
    const events = [
      { id: "past", startsAt: "2026-06-01T20:00:00.000Z" },
      { id: "soon", startsAt: "2026-07-01T20:00:00.000Z" },
      { id: "later", startsAt: "2026-08-01T20:00:00.000Z" },
      { id: "earlier-past", startsAt: "2026-05-01T20:00:00.000Z" },
    ];

    const { upcoming, past } = partitionEventsByTime(events, now);

    expect(upcoming.map((event) => event.id)).toEqual(["soon", "later"]);
    expect(past.map((event) => event.id)).toEqual(["past", "earlier-past"]);
  });

  it("treats events at the same instant as upcoming", () => {
    const { upcoming, past } = partitionEventsByTime(
      [{ id: "now", startsAt: now.toISOString() }],
      now,
    );

    expect(upcoming).toHaveLength(1);
    expect(past).toHaveLength(0);
  });
});
