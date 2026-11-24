import { describe, expect, it } from "vitest";

import {
  reducedDimensions,
  reducedFileName,
  reductionQualities,
  SITE_PHOTO_REDUCTION,
  shouldReduceImage,
} from "./image-reduction";

const MB = 1024 * 1024;

describe("shouldReduceImage", () => {
  it("re-encodes any photo over 1 MB", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) {
      expect(
        shouldReduceImage({ size: 2 * MB, type }, SITE_PHOTO_REDUCTION),
      ).toBe(true);
    }
  });

  it("leaves small files, GIFs and fields that opt out alone", () => {
    expect(
      shouldReduceImage(
        { size: 0.5 * MB, type: "image/jpeg" },
        SITE_PHOTO_REDUCTION,
      ),
    ).toBe(false);
    expect(
      shouldReduceImage(
        { size: 20 * MB, type: "image/gif" },
        SITE_PHOTO_REDUCTION,
      ),
    ).toBe(false);
    expect(shouldReduceImage({ size: 20 * MB, type: "image/jpeg" }, null)).toBe(
      false,
    );
  });
});

describe("the site's photos", () => {
  it("never keep more pixels than the site can show", () => {
    expect(reducedDimensions(6000, 4000, SITE_PHOTO_REDUCTION.maxSide)).toEqual(
      { width: 3840, height: 2560 },
    );
    expect(reducedDimensions(3000, 4500, SITE_PHOTO_REDUCTION.maxSide)).toEqual(
      { width: 2560, height: 3840 },
    );
  });

  it("never enlarge", () => {
    expect(reducedDimensions(1600, 1200, SITE_PHOTO_REDUCTION.maxSide)).toEqual(
      { width: 1600, height: 1200 },
    );
  });
});

describe("reductionQualities", () => {
  it("steps down from the profile's quality, never below 0.7", () => {
    expect(reductionQualities(SITE_PHOTO_REDUCTION)).toEqual([0.85, 0.8, 0.75]);
  });
});

describe("reducedFileName", () => {
  it("names the file for its new format", () => {
    expect(reducedFileName("retrato.final.PNG", "image/webp")).toBe(
      "retrato.final.webp",
    );
    expect(reducedFileName("sem-extensao", "image/jpeg")).toBe(
      "sem-extensao.jpg",
    );
  });
});
