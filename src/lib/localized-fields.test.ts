import { describe, expect, it } from "vitest";

import { toNullableLocalizedText } from "./localized-fields";

describe("toNullableLocalizedText", () => {
  it("keeps Portuguese and nulls empty translations", () => {
    expect(
      toNullableLocalizedText({
        pt: "Concerto em São Paulo",
        en: "  ",
        es: "Concierto",
      }),
    ).toEqual({
      pt: "Concerto em São Paulo",
      en: null,
      es: "Concierto",
    });
  });
});
