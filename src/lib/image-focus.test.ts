import { describe, expect, it } from "vitest";

import {
  DEFAULT_IMAGE_FOCUS,
  IMAGE_FOCUS_PRESETS,
  normalizeImageFocus,
  parseImageFocus,
  presetForFocus,
} from "./image-focus";

describe("normalizeImageFocus", () => {
  it("keeps the values the old dropdown saved", () => {
    for (const saved of ["50% 28%", "50% 50%", "50% 18%", "50% 72%"]) {
      expect(normalizeImageFocus(saved)).toBe(saved);
    }
  });

  it("rounds a point picked on the photo", () => {
    expect(normalizeImageFocus("33.333% 61.9%")).toBe("33% 62%");
  });

  it("refuses anything that is not two percentages", () => {
    for (const value of [
      "",
      null,
      "center",
      "50%",
      "120% 10%",
      "50% 28%; background: url(x)",
    ]) {
      expect(normalizeImageFocus(value)).toBe(DEFAULT_IMAGE_FOCUS);
    }
  });
});

describe("presetForFocus", () => {
  it("recognises every preset", () => {
    for (const preset of IMAGE_FOCUS_PRESETS) {
      expect(presetForFocus(`${preset.x}% ${preset.y}%`)).toBe(preset);
    }
  });

  it("maps the old dropdown values onto the grid", () => {
    expect(presetForFocus("50% 28%")?.label).toBe("Em cima, no centro");
    expect(presetForFocus("50% 18%")?.label).toBe("Em cima, no centro");
    expect(presetForFocus("50% 72%")?.label).toBe("Embaixo, no centro");
  });

  it("leaves a point picked on the photo as its own", () => {
    expect(presetForFocus("38% 62%")).toBeNull();
    expect(parseImageFocus("38% 62%")).toEqual({ x: 38, y: 62 });
  });
});
