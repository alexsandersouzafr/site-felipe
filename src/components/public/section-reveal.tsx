import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionRevealProps = {
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
};

export function SectionReveal({
  children,
  className,
  as: Tag = "section",
}: SectionRevealProps) {
  return (
    <Tag
      className={cn(
        "animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
