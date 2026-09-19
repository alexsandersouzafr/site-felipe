"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { type ReactNode, useState } from "react";

import { GsapScrollRoot } from "@/components/gsap-scroll-root";
import type { SiteTheme } from "@/lib/site-theme";

export function Providers({
  children,
  defaultTheme,
}: {
  children: ReactNode;
  /** Chosen in the admin; a visitor's own switch, once made, wins. */
  defaultTheme: SiteTheme;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem>
      <QueryClientProvider client={queryClient}>
        <GsapScrollRoot />
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
