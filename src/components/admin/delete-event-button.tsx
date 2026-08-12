"use client";

import { deleteEvent } from "@/app/admin/(protected)/agenda/actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";

export function DeleteEventButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      action={deleteEvent}
      id={id}
      message="Excluir este evento permanentemente? Esta ação não pode ser desfeita."
    />
  );
}
