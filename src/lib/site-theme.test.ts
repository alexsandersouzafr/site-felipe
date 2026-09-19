import { describe, expect, it } from "vitest";

import { parseSiteTheme, SITE_THEMES } from "./site-theme";

describe("parseSiteTheme", () => {
  it("accepts the themes the database allows", () => {
    for (const theme of SITE_THEMES) {
      expect(parseSiteTheme(theme)).toBe(theme);
    }
  });

  it("rejects anything else", () => {
    expect(parseSiteTheme("sepia")).toBeNull();
    expect(parseSiteTheme("")).toBeNull();
    expect(parseSiteTheme(null)).toBeNull();
    expect(parseSiteTheme(undefined)).toBeNull();
  });
});
