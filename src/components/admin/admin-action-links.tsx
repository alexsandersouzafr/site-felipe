"use client";

import { EyeIcon, PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminCreateLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ size: "lg" }), "inline-flex gap-1.5")}
    >
      <PlusIcon className="size-4" data-icon="inline-start" />
      {children}
    </Link>
  );
}

export function AdminEditLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Editar"
      title="Editar"
      className={buttonVariants({ variant: "ghost", size: "icon" })}
    >
      <PencilSimpleIcon className="size-4" />
    </Link>
  );
}

export function AdminViewLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "inline-flex gap-1.5",
      )}
    >
      <EyeIcon className="size-3.5" data-icon="inline-start" />
      Ver
    </Link>
  );
}

/**
 * Toggle-style filter button for list toolbars. `href` is where the button
 * leads to, i.e. the state it switches to when pressed.
 */
export function AdminFilterLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "inline-flex gap-1.5",
        active && "border-primary/40 bg-primary/10 text-primary",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

/** Small tab bar made of links, for switching between lists of one screen. */
export function AdminTabLinks({
  label,
  items,
}: {
  label: string;
  items: Array<{ href: string; label: ReactNode; active: boolean }>;
}) {
  return (
    <nav
      aria-label={label}
      className="inline-flex rounded-xl border border-border/80 p-0.5 text-sm"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "rounded-lg px-3 py-1.5 transition-colors",
            item.active
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
