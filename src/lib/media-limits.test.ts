import { describe, expect, it } from "vitest";

import {
  MAX_IMAGE_BYTES,
  MAX_PRESS_IMAGE_BYTES,
  MAX_REQUEST_BYTES,
  validateImageFile,
  validateRequestSize,
} from "./media-limits";

function fakeFile(size: number, type = "image/jpeg") {
  return new File([new Uint8Array(size)], "photo.jpg", { type });
}

describe("validateImageFile", () => {
  it("accepts a jpeg under the size limit", () => {
    expect(validateImageFile(fakeFile(1024))).toEqual({ ok: true });
  });

  it("rejects oversized files", () => {
    const result = validateImageFile(fakeFile(MAX_IMAGE_BYTES + 1));
    expect(result.ok).toBe(false);
  });

  it("names the limit it applied", () => {
    const result = validateImageFile(fakeFile(MAX_IMAGE_BYTES + 1));

    expect(result.ok === false && result.error).toContain("15 MB");
  });

  it("accepts press uploads within the press limit", () => {
    expect(
      validateImageFile(fakeFile(MAX_IMAGE_BYTES + 1), MAX_PRESS_IMAGE_BYTES),
    ).toEqual({ ok: true });
  });

  it("rejects files above the press limit", () => {
    const result = validateImageFile(
      fakeFile(MAX_PRESS_IMAGE_BYTES + 1),
      MAX_PRESS_IMAGE_BYTES,
    );

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error).toContain("30 MB");
  });

  it("rejects unsupported mime types", () => {
    const result = validateImageFile(fakeFile(1024, "image/svg+xml"));
    expect(result.ok).toBe(false);
  });
});

describe("validateRequestSize", () => {
  function formWith(...sizes: number[]) {
    const form = new FormData();
    form.set("titlePt", "Um post");
    sizes.forEach((size, index) => {
      form.set(`blockImage-${index}`, fakeFile(size));
    });
    return form;
  }

  it("accepts files that fit in one request", () => {
    expect(validateRequestSize(formWith(MAX_IMAGE_BYTES, 1024))).toEqual({
      ok: true,
    });
  });

  // Every file can be inside its own limit and the request still be refused,
  // which is how a blog post with three images used to crash on save.
  it("refuses a total above the request limit", () => {
    const result = validateRequestSize(
      formWith(MAX_IMAGE_BYTES, MAX_IMAGE_BYTES, MAX_IMAGE_BYTES),
    );

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error).toContain("45 MB");
  });

  it("counts only files, not the text fields around them", () => {
    expect(validateRequestSize(formWith(), MAX_REQUEST_BYTES)).toEqual({
      ok: true,
    });
  });
});
