import { describe, expect, it } from "vitest";

import {
  blogCoverFrames,
  homeBandFrames,
  homeHeroFrames,
  pageCoverFrames,
} from "./site-frames";

describe("site frames", () => {
  it("fill the whole screen for the home opening photo", () => {
    const [desktop, phone] = homeHeroFrames();

    expect([desktop.width, desktop.height]).toEqual([1440, 900]);
    expect([phone.width, phone.height]).toEqual([390, 844]);
    // Measured on the home page at 1440×900: the photo's box starts 124 px
    // above the screen once scaled, which is this top plus half the growth.
    expect(desktop.image?.height).toBeCloseTo(1044);
    expect(desktop.image?.top).toBeCloseTo(-103.32);
    expect(
      (desktop.image?.top ?? 0) - ((desktop.image?.height ?? 0) * 0.04) / 2,
    ).toBeCloseTo(-124.2, 0);
  });

  // h-[min(62vh,36rem)] min-h-[24rem], over a photo 100vh + 10rem tall.
  it("open a band onto a screen-sized photo", () => {
    const [desktop, phone] = homeBandFrames();

    expect(desktop.height).toBeCloseTo(558);
    expect(desktop.image?.height).toBe(1060);
    expect(desktop.image?.top).toBeCloseTo(-80 + 0.46 * (558 - 900));
    expect(phone.height).toBeCloseTo(523.28);
  });

  // h-[min(56vh,32rem)] min-h-[22rem]
  it("keep the page cover between 22rem and 32rem", () => {
    const [desktop, phone] = pageCoverFrames();

    expect(desktop.height).toBeCloseTo(504);
    expect(phone.height).toBeCloseTo(472.64);
    expect(desktop.overlay).toBe("pageCover");
  });

  it("show a post cover framed the way the post page uses it", () => {
    const frames = blogCoverFrames();

    expect(frames.map((frame) => frame.focus)).toEqual([
      "50% 28%",
      "50% 28%",
      "50% 50%",
      "50% 50%",
    ]);
    expect(frames[0].overlay).toBe("pageCoverStrong");
  });
});
