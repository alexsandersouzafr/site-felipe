"use client";

import { useEffect } from "react";

import { useAdminToast } from "@/components/admin/toast";
import { FieldError } from "@/components/ui/field";

export type AdminFormState = {
  error?: string;
  success?: string;
};

/**
 * The single place a form reports back. The error stays next to the fields,
 * where someone filling a long form looks, and is repeated as a toast for
 * anyone who has already scrolled past it.
 */
export function FormFeedback({ state }: { state: AdminFormState }) {
  const toast = useAdminToast();

  // `useActionState` hands back a new object on every submit, so submitting
  // twice with the same problem still raises a second toast.
  useEffect(() => {
    if (state.error) {
      toast({ tone: "error", message: state.error });
      return;
    }

    if (state.success) {
      toast({ tone: "success", message: state.success });
    }
  }, [state, toast]);

  if (!state.error) {
    return null;
  }

  return <FieldError>{state.error}</FieldError>;
}
