import { describe, expect, it } from "vitest";

import {
  PRESS_PHOTO_CATEGORIES,
  PRESS_PHOTO_CATEGORY_LABELS,
  parsePressPhotoCategory,
} from "./press-categories";

describe("parsePressPhotoCategory", () => {
  it("accepts the two known categories", () => {
    expect(parsePressPhotoCategory("conductor")).toBe("conductor");
    expect(parsePressPhotoCategory("stage")).toBe("stage");
  });

  it("rejects anything else", () => {
    expect(parsePressPhotoCategory("portrait")).toBeNull();
    expect(parsePressPhotoCategory("")).toBeNull();
    expect(parsePressPhotoCategory(null)).toBeNull();
    expect(parsePressPhotoCategory(undefined)).toBeNull();
  });
});

describe("PRESS_PHOTO_CATEGORY_LABELS", () => {
  it("names every category", () => {
    for (const category of PRESS_PHOTO_CATEGORIES) {
      expect(PRESS_PHOTO_CATEGORY_LABELS[category].label).not.toBe("");
    }
  });
});
