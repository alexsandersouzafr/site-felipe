"use client";

import { ArrowUpIcon } from "@phosphor-icons/react";

import { getLenis } from "@/components/gsap-scroll-root";

export function BackToTop({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="group inline-flex cursor-pointer items-center gap-3 tracking-[0.2em] uppercase transition-colors hover:text-foreground"
      onClick={() => {
        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(0, { duration: 1.6 });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
    >
      {label}
      <ArrowUpIcon className="size-3.5 transition-transform duration-500 group-hover:-translate-y-1" />
    </button>
  );
}
