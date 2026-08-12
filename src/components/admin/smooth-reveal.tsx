"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Animates open/close height so surrounding layout reflows smoothly. */
export function SmoothReveal({
  open,
  children,
  className,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-in-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        className,
      )}
      aria-hidden={!open}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            "transition-opacity duration-300 ease-in-out",
            open ? "opacity-100" : "opacity-0",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
