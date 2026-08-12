import type { ReactNode } from "react";

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_oklch(0.97_0.02_20),_var(--background)_55%)] px-4 py-10">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
