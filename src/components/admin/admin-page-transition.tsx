"use client";

import type { ReactNode } from "react";

/** Subtle enter motion when switching admin CRUD routes (via template remount). */
export function AdminPageTransition({ children }: { children: ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
      {children}
    </div>
  );
}
