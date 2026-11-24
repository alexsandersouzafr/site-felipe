import { describe, expect, it } from "vitest";

import { coverCrop } from "./og-crop";

const OG = { width: 1200, height: 630 };

describe("coverCrop", () => {
  it("fits a 3:2 photo by width and slides it by the vertical focus", () => {
    expect(coverCrop(6000, 4000, OG, "50% 18%")).toEqual({
      resized: { width: 1200, height: 800 },
      left: 0,
      top: 31,
    });
  });

  it("fits a portrait by width, keeping the face near the top", () => {
    const crop = coverCrop(2560, 3840, OG, "50% 28%");

    expect(crop.resized).toEqual({ width: 1200, height: 1800 });
    expect(crop.top).toBe(328);
  });

  it("fits a panorama by height and slides it sideways", () => {
    expect(coverCrop(8000, 2000, OG, "75% 50%")).toEqual({
      resized: { width: 2520, height: 630 },
      left: 990,
      top: 0,
    });
  });

  it("centres a photo whose framing is unreadable", () => {
    expect(coverCrop(6000, 4000, OG, "abc").top).toBe(85);
  });
});
