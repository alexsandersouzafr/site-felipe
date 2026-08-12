import { describe, expect, it } from "vitest";

import {
  MAX_BLOG_IMAGE_BYTES,
  MAX_HD_IMAGE_BYTES,
  validateImageFile,
} from "./media-limits";

function fakeFile(size: number, type = "image/jpeg") {
  return new File([new Uint8Array(size)], "photo.jpg", { type });
}

describe("validateImageFile", () => {
  it("accepts a jpeg under the size limit", () => {
    expect(validateImageFile(fakeFile(1024))).toEqual({ ok: true });
  });

  it("rejects oversized files", () => {
    const result = validateImageFile(fakeFile(MAX_BLOG_IMAGE_BYTES + 1));
    expect(result.ok).toBe(false);
  });

  it("accepts HD uploads within the HD limit", () => {
    expect(
      validateImageFile(fakeFile(MAX_BLOG_IMAGE_BYTES + 1), MAX_HD_IMAGE_BYTES),
    ).toEqual({ ok: true });
  });

  it("rejects files above the HD limit", () => {
    const result = validateImageFile(
      fakeFile(MAX_HD_IMAGE_BYTES + 1),
      MAX_HD_IMAGE_BYTES,
    );
    expect(result.ok).toBe(false);
  });

  it("rejects unsupported mime types", () => {
    const result = validateImageFile(fakeFile(1024, "image/svg+xml"));
    expect(result.ok).toBe(false);
  });
});
