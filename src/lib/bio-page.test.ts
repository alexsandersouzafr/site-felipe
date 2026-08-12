import { describe, expect, it } from "vitest";

import {
  canEnableHighlightOnPage,
  MAX_BIO_PAGE_HIGHLIGHTS,
  selectBiographyForPage,
  selectHighlightsForPage,
} from "./bio-page";

describe("selectBiographyForPage", () => {
  const now = new Date("2026-08-11T12:00:00.000Z");

  it("returns the selected visible biography", () => {
    const selected = selectBiographyForPage(
      [
        {
          id: "a",
          showOnPage: false,
          status: "published" as const,
          publishAt: null,
        },
        {
          id: "b",
          showOnPage: true,
          status: "published" as const,
          publishAt: null,
        },
      ],
      now,
    );

    expect(selected?.id).toBe("b");
  });

  it("ignores selected drafts", () => {
    expect(
      selectBiographyForPage(
        [
          {
            showOnPage: true,
            status: "draft",
            publishAt: null,
          },
        ],
        now,
      ),
    ).toBeNull();
  });
});

describe("selectHighlightsForPage", () => {
  const now = new Date("2026-08-11T12:00:00.000Z");

  it("returns up to ten selected visible highlights in display order", () => {
    const items = Array.from({ length: 12 }, (_, index) => ({
      id: String(index),
      showOnPage: true,
      status: "published" as const,
      publishAt: null,
      displayOrder: 12 - index,
    }));

    const selected = selectHighlightsForPage(items, now);

    expect(selected).toHaveLength(MAX_BIO_PAGE_HIGHLIGHTS);
    expect(selected[0]?.id).toBe("11");
    expect(selected.at(-1)?.id).toBe("2");
  });

  it("excludes unselected or invisible highlights", () => {
    const selected = selectHighlightsForPage(
      [
        {
          id: "1",
          showOnPage: true,
          status: "draft",
          publishAt: null,
          displayOrder: 1,
        },
        {
          id: "2",
          showOnPage: false,
          status: "published",
          publishAt: null,
          displayOrder: 2,
        },
        {
          id: "3",
          showOnPage: true,
          status: "published",
          publishAt: null,
          displayOrder: 3,
        },
      ],
      now,
    );

    expect(selected.map((item) => item.id)).toEqual(["3"]);
  });
});

describe("canEnableHighlightOnPage", () => {
  it("allows keeping an already selected highlight at the limit", () => {
    expect(canEnableHighlightOnPage(true, MAX_BIO_PAGE_HIGHLIGHTS)).toBe(true);
  });

  it("blocks a new selection at the limit", () => {
    expect(canEnableHighlightOnPage(false, MAX_BIO_PAGE_HIGHLIGHTS)).toBe(
      false,
    );
  });
});
