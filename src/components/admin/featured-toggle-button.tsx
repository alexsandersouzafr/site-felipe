"use client";

import { CircleNotchIcon, StarIcon } from "@phosphor-icons/react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Star button for the "featured" toggle; shows a spinner while the action runs. */
export function FeaturedToggleButton({ isFeatured }: { isFeatured: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="ghost"
      size="icon-sm"
      isPending={pending}
      aria-label={
        isFeatured ? "Remover dos favoritos" : "Adicionar aos favoritos"
      }
    >
      {pending ? (
        <CircleNotchIcon
          className="size-4 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      ) : (
        <StarIcon
          className={cn(
            "size-4",
            isFeatured ? "text-amber-500" : "text-muted-foreground",
          )}
          weight={isFeatured ? "fill" : "regular"}
        />
      )}
    </Button>
  );
}
