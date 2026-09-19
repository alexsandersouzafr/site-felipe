import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** "01 —— O MAESTRO": the small numbered label that opens a section. */
export function SectionLabel({
  index,
  children,
  className,
}: {
  index: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      data-reveal="fade"
      className={cn(
        "flex items-center gap-4 self-start text-xs tracking-[0.28em] text-muted-foreground uppercase",
        className,
      )}
    >
      <span className="tabular-nums">{String(index).padStart(2, "0")}</span>
      <span aria-hidden="true" className="h-px w-10 bg-current opacity-40" />
      <span>{children}</span>
    </p>
  );
}

/**
 * A link whose arrow slides out and a fresh one slides in on hover. `solid`
 * is the filled call to action, `plain` a quieter text link.
 */
export function ArrowLink({
  href,
  children,
  variant = "plain",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline" | "plain";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-4 text-xs tracking-[0.2em] uppercase transition-colors",
        variant === "solid" &&
          "h-12 bg-primary px-6 text-primary-foreground hover:bg-primary/88",
        variant === "outline" &&
          "h-12 border border-foreground/20 px-6 hover:border-foreground/60",
        variant === "plain" && "py-1",
        className,
      )}
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        className="relative inline-flex size-4 overflow-hidden"
      >
        <ArrowRightIcon className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-full" />
        <ArrowRightIcon className="absolute inset-0 size-4 -translate-x-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0" />
      </span>
    </Link>
  );
}
