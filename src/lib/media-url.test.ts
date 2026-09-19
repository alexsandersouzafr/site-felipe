import { afterEach, describe, expect, it } from "vitest";

import {
  downloadFileName,
  mediaDownloadUrl,
  mediaPublicUrl,
} from "./media-url";

describe("mediaPublicUrl", () => {
  const original = process.env.NEXT_PUBLIC_SUPABASE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = original;
  });

  it("builds a public media url", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co/";
    expect(mediaPublicUrl("photos/a.jpg")).toBe(
      "https://example.supabase.co/storage/v1/object/public/media/photos/a.jpg",
    );
  });

  it("returns null for empty paths", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    expect(mediaPublicUrl("")).toBeNull();
  });
});

describe("downloadFileName", () => {
  it("slugifies the description and keeps the file's extension", () => {
    expect(
      downloadFileName("press/abc-123.JPG", "Maestro regendo, São Paulo!"),
    ).toBe("maestro-regendo-sao-paulo.jpg");
  });

  it("falls back to a generic name", () => {
    expect(downloadFileName("press/abc.png", "")).toBe("foto.png");
    expect(downloadFileName("press/abc.png", null)).toBe("foto.png");
    expect(downloadFileName("press/abc.png", "!!!")).toBe("foto.png");
  });

  it("keeps long descriptions short", () => {
    const name = downloadFileName("press/a.jpg", "a".repeat(200));
    expect(name.length).toBeLessThanOrEqual(64);
  });
});

describe("mediaDownloadUrl", () => {
  const original = process.env.NEXT_PUBLIC_SUPABASE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = original;
  });

  it("adds the download parameter with an encoded file name", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    expect(mediaDownloadUrl("press/a.jpg", "maestro regendo.jpg")).toBe(
      "https://example.supabase.co/storage/v1/object/public/media/press/a.jpg?download=maestro%20regendo.jpg",
    );
  });

  it("returns null without a path", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    expect(mediaDownloadUrl(null, "a.jpg")).toBeNull();
  });
});
