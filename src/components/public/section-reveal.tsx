import type { ReactNode } from "react";

import { Reveal, type RevealVariant } from "@/components/public/reveal";

type SectionRevealProps = {
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
  /**
   * How the section itself comes in; `null` when its children carry their own
   * `data-reveal` animations and the section should just host them.
   */
  variant?: RevealVariant | null;
};

export function SectionReveal({
  children,
  className,
  as = "section",
  variant = "fade",
}: SectionRevealProps) {
  return (
    <Reveal as={as} variant={variant ?? undefined} className={className}>
      {children}
    </Reveal>
  );
}
