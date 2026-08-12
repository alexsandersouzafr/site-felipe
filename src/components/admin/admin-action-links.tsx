"use client";

import { PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react";
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
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "inline-flex gap-1.5",
      )}
    >
      <PencilSimpleIcon className="size-3.5" data-icon="inline-start" />
      Editar
    </Link>
  );
}
