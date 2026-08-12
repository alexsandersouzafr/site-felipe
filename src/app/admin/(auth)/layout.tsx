import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_oklch(0.97_0.02_20),_var(--background)_55%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top,_oklch(0.28_0.03_20),_var(--background)_55%)]">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
