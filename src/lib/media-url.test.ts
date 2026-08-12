import { afterEach, describe, expect, it } from "vitest";

import { mediaPublicUrl } from "./media-url";

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
