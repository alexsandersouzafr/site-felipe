import type { ReactNode } from "react";

import { PageTransition } from "@/components/public/page-transition";

/** Remounts on every navigation, so each new page fades in. */
export default function LocaleTemplate({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
