"use client";

import { type ReactNode, useLayoutEffect, useRef } from "react";

import { gsap, prefersReducedMotion } from "@/lib/motion";

let firstPath: string | null = null;
let hasNavigated = false;

/**
 * A light hand-over between pages: the new page fades in while rising a few
 * pixels. Skipped on the first load (the page's own entrance animations
 * already open it), including React's development double mount.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  // Before paint, so the new page never flashes at full opacity first.
  useLayoutEffect(() => {
    const el = ref.current;
    const path = window.location.pathname + window.location.search;
    firstPath ??= path;

    if (!el || (!hasNavigated && path === firstPath)) {
      return;
    }
    hasNavigated = true;

    if (prefersReducedMotion()) {
      return;
    }

    const tween = gsap.fromTo(
      el,
      { autoAlpha: 0, y: 14 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        clearProps: "transform,opacity,visibility",
      },
    );

    return () => {
      tween.kill();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
