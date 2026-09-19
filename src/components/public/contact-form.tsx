"use client";

import { useTranslations } from "next-intl";
import { useActionState, useId, useState } from "react";

import {
  type ContactFormState,
  submitContactMessage,
} from "@/app/[locale]/contato/actions";
import { TurnstileWidget } from "@/components/public/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: ContactFormState = { status: "idle" };

const ERROR_KEYS = {
  validation: "validationError",
  rateLimited: "rateLimitedError",
  tooFast: "tooFastError",
  expired: "expiredError",
  tooManyLinks: "tooManyLinksError",
  captcha: "captchaError",
  server: "error",
} as const;

export function ContactForm({
  formToken,
  turnstileSiteKey,
}: {
  /** Signed proof of when the page was rendered (see `createFormToken`). */
  formToken: string;
  /** Present only when the Turnstile CAPTCHA is configured. */
  turnstileSiteKey?: string | null;
}) {
  const t = useTranslations("Contact");
  const id = useId();
  const [state, formAction, pending] = useActionState(
    submitContactMessage,
    initialState,
  );
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const waitingForCaptcha = Boolean(turnstileSiteKey) && !captchaToken;

  return (
    <form action={formAction} className="space-y-5">
      <label
        aria-hidden="true"
        className="absolute -left-[9999px] top-auto size-px overflow-hidden"
      >
        Deixe este campo em branco
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
      <input type="hidden" name="formToken" value={formToken} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 text-sm">
          <label htmlFor={`${id}-name`} className="block">
            {t("formName")} <span className="text-destructive">*</span>
          </label>
          <Input
            id={`${id}-name`}
            name="name"
            required
            autoComplete="name"
            maxLength={120}
          />
        </div>
        <div className="space-y-2 text-sm">
          <label htmlFor={`${id}-email`} className="block">
            {t("formEmail")} <span className="text-destructive">*</span>
          </label>
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={254}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <label htmlFor={`${id}-subject`} className="block">
          {t("formSubject")} <span className="text-destructive">*</span>
        </label>
        <Input id={`${id}-subject`} name="subject" required maxLength={200} />
      </div>

      <div className="space-y-2 text-sm">
        <label htmlFor={`${id}-message`} className="block">
          {t("formMessage")} <span className="text-destructive">*</span>
        </label>
        <Textarea
          id={`${id}-message`}
          name="message"
          required
          rows={6}
          maxLength={5000}
        />
      </div>

      {turnstileSiteKey ? (
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          resetSignal={state}
          onTokenChange={setCaptchaToken}
        />
      ) : null}

      {state.status === "success" ? (
        <p className="text-sm text-foreground" role="status">
          {t("success")}
        </p>
      ) : null}

      {state.status === "error" ? (
        <p className="text-sm text-destructive" role="alert">
          {t(ERROR_KEYS[state.message])}
        </p>
      ) : null}

      <Button
        type="submit"
        isDisabled={pending || waitingForCaptcha}
        className="cursor-pointer"
      >
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
