"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { gsap, prefersReducedMotion } from "@/lib/motion";

/**
 * Lets the hero's text drift up and fade while the photo scrolls away, so the
 * opening frame hands over to the page instead of just sliding off.
 */
export function HeroDrift({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: -14,
        opacity: 0.1,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest("[data-header-overlay]") ?? el.parentElement,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
