"use client";

import { TrashIcon } from "@phosphor-icons/react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmDeleteButton({
  action,
  id,
  label = "Excluir",
  message = "Excluir permanentemente? Esta ação não pode ser desfeita.",
  iconOnly = false,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  message?: string;
  /** Compact trash button for table rows; `label` becomes its tooltip. */
  iconOnly?: boolean;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      {iconOnly ? (
        <button
          type="submit"
          aria-label={label}
          title={label}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
          )}
        >
          <TrashIcon className="size-4" />
        </button>
      ) : (
        <Button type="submit" variant="destructive" size="sm">
          <TrashIcon className="size-3.5" data-icon="inline-start" />
          {label}
        </Button>
      )}
    </form>
  );
}
