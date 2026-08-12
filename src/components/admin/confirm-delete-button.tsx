"use client";

import { TrashIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

export function ConfirmDeleteButton({
  action,
  id,
  label = "Excluir",
  message = "Excluir permanentemente? Esta ação não pode ser desfeita.",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  message?: string;
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
      <Button type="submit" variant="destructive" size="sm">
        <TrashIcon className="size-3.5" data-icon="inline-start" />
        {label}
      </Button>
    </form>
  );
}
