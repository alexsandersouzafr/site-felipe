import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

/**
 * The site's two curves: a long, soft landing for things entering the page,
 * and a symmetrical one for things that cross it (curtains, panels).
 */
export const EASE_REVEAL = "expo.out";
export const EASE_SWEEP = CustomEase.create("sweep", "0.76, 0, 0.24, 1");

/** Where on the screen an element starts animating as it scrolls in. */
export const REVEAL_START = "top 88%";

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Tells the inline safety script in the root layout that animations are
 * running, so it does not force hidden `[data-reveal]` elements visible.
 */
export function markMotionReady() {
  document.documentElement.classList.add("motion-ready");
}

export { gsap, ScrollTrigger, SplitText };
