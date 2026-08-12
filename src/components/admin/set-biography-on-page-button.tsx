"use client";

import { CheckCircleIcon } from "@phosphor-icons/react";

import { setBiographyOnPage } from "@/app/admin/(protected)/editorial/actions";
import { Button } from "@/components/ui/button";

export function SetBiographyOnPageButton({
  id,
  isOnPage,
}: {
  id: string;
  isOnPage: boolean;
}) {
  if (isOnPage) {
    return (
      <span className="inline-flex h-7 items-center gap-1.5 rounded-2xl bg-muted px-3 text-xs font-medium text-muted-foreground">
        <CheckCircleIcon className="size-3.5" />
        Na página
      </span>
    );
  }

  return (
    <form action={setBiographyOnPage}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="outline" size="sm">
        Usar nesta página
      </Button>
    </form>
  );
}
