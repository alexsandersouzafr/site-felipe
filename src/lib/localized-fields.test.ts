import { describe, expect, it } from "vitest";

import { toNullableLocalizedText } from "./localized-fields";

describe("toNullableLocalizedText", () => {
  it("keeps Portuguese and nulls empty translations", () => {
    expect(
      toNullableLocalizedText({
        pt: "Concerto em São Paulo",
        en: "  ",
        fr: "Concert",
      }),
    ).toEqual({
      pt: "Concerto em São Paulo",
      en: null,
      fr: "Concert",
    });
  });
});
