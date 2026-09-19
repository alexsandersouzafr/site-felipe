import type { ReactNode } from "react";

import { PageCurtain } from "@/components/public/page-curtain";

/** Remounts on every navigation, so each page arrives behind the curtain. */
export default function LocaleTemplate({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <PageCurtain />
    </>
  );
}
