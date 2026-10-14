"use client";

import { type FormEvent, startTransition } from "react";

/**
 * Sends a form to its action without letting React clear it afterwards.
 *
 * React 19 resets every uncontrolled field once an action passed to
 * `<form action>` finishes — also when the action answered with a validation
 * error. The person would lose what they typed, and the image they picked, at
 * the first mistake. Calling the action from `onSubmit` opts out of that
 * reset; the browser's own validation still runs first, since `submit` only
 * fires once it passes.
 */
export function submitKeepingValues(
  event: FormEvent<HTMLFormElement>,
  formAction: (formData: FormData) => void,
) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitter = (event.nativeEvent as SubmitEvent).submitter;
  // The clicked button carries the intent (draft, publish, schedule).
  const formData =
    submitter instanceof HTMLButtonElement ||
    submitter instanceof HTMLInputElement
      ? new FormData(form, submitter)
      : new FormData(form);

  startTransition(() => {
    formAction(formData);
  });
}
