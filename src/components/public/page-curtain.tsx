"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { EASE_SWEEP, gsap, prefersReducedMotion } from "@/lib/motion";

/**
 * Covers the screen when a page arrives, then rises to uncover it. Rendered
 * by the locale template, so it plays on every navigation. CSS shows it only
 * when motion is allowed and JavaScript is running (see `.page-curtain`).
 */
export function PageCurtain() {
  const t = useTranslations("Navigation");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const curtain = ref.current;
    if (!curtain) {
      return;
    }

    if (prefersReducedMotion()) {
      gsap.set(curtain, { display: "none" });
      return;
    }

    const label = curtain.querySelector("[data-curtain-label]");
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(curtain, { display: "none" });
      },
    });

    tl.fromTo(
      label,
      { yPercent: 100 },
      { yPercent: 0, duration: 0.6, ease: "expo.out" },
    )
      .to(label, { yPercent: -100, duration: 0.45, ease: "power3.in" }, 0.55)
      .to(curtain, { yPercent: -100, duration: 0.95, ease: EASE_SWEEP }, 0.75);

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="page-curtain fixed inset-0 z-[70] items-center justify-center bg-foreground text-background"
    >
      <span className="overflow-hidden">
        <span
          data-curtain-label
          className="block font-heading text-3xl tracking-tight sm:text-4xl"
        >
          {t("brand")}
        </span>
      </span>
    </div>
  );
}
