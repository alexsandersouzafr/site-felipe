"use client";

import { deleteEvent } from "@/app/admin/(protected)/agenda/actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";

export function DeleteEventButton({
  id,
  iconOnly,
}: {
  id: string;
  iconOnly?: boolean;
}) {
  return (
    <ConfirmDeleteButton
      action={deleteEvent}
      id={id}
      iconOnly={iconOnly}
      message="Excluir este evento permanentemente? Esta ação não pode ser desfeita."
    />
  );
}
