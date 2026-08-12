"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import {
  type ContactFormState,
  submitContactMessage,
} from "@/app/[locale]/contato/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: ContactFormState = { status: "idle" };

export function ContactForm() {
  const t = useTranslations("Contact");
  const [state, formAction, pending] = useActionState(
    submitContactMessage,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>
            {t("formName")} <span className="text-destructive">*</span>
          </span>
          <Input name="name" required autoComplete="name" maxLength={120} />
        </label>
        <label className="space-y-2 text-sm">
          <span>
            {t("formEmail")} <span className="text-destructive">*</span>
          </span>
          <Input
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={254}
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm">
        <span>
          {t("formSubject")} <span className="text-destructive">*</span>
        </span>
        <Input name="subject" required maxLength={200} />
      </label>

      <label className="block space-y-2 text-sm">
        <span>
          {t("formMessage")} <span className="text-destructive">*</span>
        </span>
        <Textarea name="message" required rows={6} maxLength={5000} />
      </label>

      {state.status === "success" ? (
        <p className="text-sm text-foreground" role="status">
          {t("success")}
        </p>
      ) : null}

      {state.status === "error" ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message === "validation" ? t("validationError") : t("error")}
        </p>
      ) : null}

      <Button type="submit" isDisabled={pending} className="cursor-pointer">
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
