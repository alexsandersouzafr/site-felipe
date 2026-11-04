import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config.mjs";

import {
  MAX_HD_IMAGE_BYTES,
  MAX_IMAGE_BYTES,
  MAX_REQUEST_BYTES,
  validateImageFile,
  validatePickedImage,
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
      validateImageFile(fakeFile(MAX_IMAGE_BYTES + 1), MAX_HD_IMAGE_BYTES),
    ).toEqual({ ok: true });
  });

  it("rejects files above the press limit", () => {
    const result = validateImageFile(
      fakeFile(MAX_HD_IMAGE_BYTES + 1),
      MAX_HD_IMAGE_BYTES,
    );

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error).toContain("40 MB");
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

describe("validateImageFile's refusal", () => {
  it("says how large the image is and what the limit is", () => {
    const result = validateImageFile(
      fakeFile(MAX_HD_IMAGE_BYTES + 1),
      MAX_HD_IMAGE_BYTES,
    );

    expect(result.ok === false && result.error).toBe(
      "Esta imagem tem 40,1 MB e o limite é 40 MB. Escolha uma imagem menor.",
    );
  });
});

describe("validatePickedImage", () => {
  function formWithFiles(...sizes: number[]) {
    const form = new FormData();
    sizes.forEach((size, index) => {
      form.append(`file_${index}`, fakeFile(size));
    });
    return form;
  }

  it("accepts a home photo at its limit", () => {
    expect(
      validatePickedImage(
        fakeFile(MAX_HD_IMAGE_BYTES),
        formWithFiles(MAX_HD_IMAGE_BYTES),
        MAX_HD_IMAGE_BYTES,
      ),
    ).toEqual({ ok: true });
  });

  it("refuses a file over its own limit before looking at the form", () => {
    const result = validatePickedImage(
      fakeFile(MAX_IMAGE_BYTES + 1),
      formWithFiles(MAX_IMAGE_BYTES + 1),
    );

    expect(result.ok === false && result.error).toContain("limite é 15 MB");
  });

  it("refuses a file that fits alone but pushes the form over one save", () => {
    const size = 25 * 1024 * 1024;
    const result = validatePickedImage(
      fakeFile(size),
      formWithFiles(size, size),
      MAX_HD_IMAGE_BYTES,
    );

    expect(result.ok === false && result.error).toContain("somam 50 MB");
  });
});

describe("the body limits in next.config.mjs", () => {
  // Past either one the form never reaches the action. The proxy's limit was
  // left at its 10 MB default once, and any larger upload hit the error screen.
  it.each([
    [
      "serverActions.bodySizeLimit",
      nextConfig.experimental?.serverActions?.bodySizeLimit,
    ],
    ["proxyClientMaxBodySize", nextConfig.experimental?.proxyClientMaxBodySize],
  ])("%s leaves room for the largest request", (_name, limit) => {
    expect(MAX_HD_IMAGE_BYTES).toBeLessThanOrEqual(MAX_REQUEST_BYTES);
    expect(Number.parseInt(String(limit), 10) * 1024 * 1024).toBeGreaterThan(
      MAX_REQUEST_BYTES,
    );
  });
});
