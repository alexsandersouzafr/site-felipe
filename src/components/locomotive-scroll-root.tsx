"use client";

import type LocomotiveScroll from "locomotive-scroll";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function LocomotiveScrollRoot() {
  const pathname = usePathname();
  const scrollRef = useRef<LocomotiveScroll | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    void (async () => {
      const LocomotiveScrollCtor = (await import("locomotive-scroll")).default;
      if (cancelled) {
        return;
      }

      scrollRef.current = new LocomotiveScrollCtor({
        lenisOptions: {
          lerp: 0.1,
          smoothWheel: true,
        },
      });
    })();

    return () => {
      cancelled = true;
      scrollRef.current?.destroy();
      scrollRef.current = null;
    };
  }, []);

  useEffect(() => {
    // Recalculate scroll bounds after client navigations.
    if (pathname) {
      scrollRef.current?.resize();
    }
  }, [pathname]);

  return null;
}
