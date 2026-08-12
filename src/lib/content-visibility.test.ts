import { describe, expect, it } from "vitest";

import { isPubliclyVisible } from "./content-visibility";

describe("isPubliclyVisible", () => {
  const now = new Date("2026-08-11T12:00:00.000Z");

  it("shows published content immediately", () => {
    expect(
      isPubliclyVisible({ status: "published", publishAt: null }, now),
    ).toBe(true);
  });

  it("shows scheduled content only after its publication time", () => {
    expect(
      isPubliclyVisible(
        { status: "scheduled", publishAt: "2026-08-11T12:01:00.000Z" },
        now,
      ),
    ).toBe(false);
    expect(
      isPubliclyVisible(
        { status: "scheduled", publishAt: "2026-08-11T11:59:00.000Z" },
        now,
      ),
    ).toBe(true);
  });

  it("never shows drafts", () => {
    expect(isPubliclyVisible({ status: "draft", publishAt: null }, now)).toBe(
      false,
    );
  });
});
