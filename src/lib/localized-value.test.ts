import { describe, expect, it } from "vitest";

import { getLocalizedValue } from "./localized-value";

describe("getLocalizedValue", () => {
  it("returns the requested localized value when available", () => {
    expect(
      getLocalizedValue({ pt: "Português", en: "English", es: null }, "en"),
    ).toBe("English");
  });

  it("falls back to Portuguese for missing translations", () => {
    expect(
      getLocalizedValue({ pt: "Português", en: null, es: null }, "es"),
    ).toBe("Português");
  });
});
