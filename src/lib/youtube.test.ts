import { describe, expect, it } from "vitest";

import { extractYouTubeId, isYouTubeUrl } from "./youtube";

describe("youtube helpers", () => {
  it("accepts standard YouTube URLs", () => {
    expect(isYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      true,
    );
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("rejects non-YouTube URLs", () => {
    expect(isYouTubeUrl("https://vimeo.com/123")).toBe(false);
  });
});
