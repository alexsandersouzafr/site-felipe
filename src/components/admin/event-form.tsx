"use client";

import { useActionState } from "react";

import type { EventActionState } from "@/app/admin/(protected)/agenda/actions";
import { PublishingControls } from "@/components/admin/publishing-fields";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { COMMON_TIME_ZONES, type EventFormValues } from "@/lib/event-form";

type EventFormProps = {
  action: (
    prev: EventActionState,
    formData: FormData,
  ) => Promise<EventActionState>;
  initialValues?: Partial<EventFormValues>;
  mode: "create" | "edit";
};

const emptyValues: EventFormValues = {
  status: "draft",
  publishAt: null,
  titlePt: "",
  titleEn: null,
  titleEs: null,
  venue: "",
  city: "",
  country: "Brasil",
  timeZone: "America/Sao_Paulo",
  startsAtLocal: "",
  endsAtLocal: null,
  ticketUrl: null,
};

export function EventForm({ action, initialValues, mode }: EventFormProps) {
  const values = { ...emptyValues, ...initialValues };
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-8">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="titlePt">Título (PT)</FieldLabel>
          <Input
            id="titlePt"
            name="titlePt"
            required
            defaultValue={values.titlePt}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="titleEn">Título (EN)</FieldLabel>
            <Input
              id="titleEn"
              name="titleEn"
              defaultValue={values.titleEn ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="titleEs">Título (ES)</FieldLabel>
            <Input
              id="titleEs"
              name="titleEs"
              defaultValue={values.titleEs ?? ""}
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="venue">Local</FieldLabel>
            <Input
              id="venue"
              name="venue"
              required
              defaultValue={values.venue}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="city">Cidade</FieldLabel>
            <Input id="city" name="city" required defaultValue={values.city} />
          </Field>
          <Field>
            <FieldLabel htmlFor="country">País</FieldLabel>
            <Input
              id="country"
              name="country"
              required
              defaultValue={values.country}
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="timeZone">Fuso horário</FieldLabel>
            <select
              id="timeZone"
              name="timeZone"
              defaultValue={values.timeZone}
              className="flex h-9 w-full rounded-2xl border border-input bg-transparent px-3 text-sm outline-none"
            >
              {COMMON_TIME_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="startsAtLocal">Início (hora local)</FieldLabel>
            <Input
              id="startsAtLocal"
              name="startsAtLocal"
              type="datetime-local"
              required
              defaultValue={values.startsAtLocal}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="endsAtLocal">Fim (opcional)</FieldLabel>
            <Input
              id="endsAtLocal"
              name="endsAtLocal"
              type="datetime-local"
              defaultValue={values.endsAtLocal ?? ""}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="ticketUrl">Link de ingressos</FieldLabel>
          <Input
            id="ticketUrl"
            name="ticketUrl"
            type="url"
            placeholder="https://"
            defaultValue={values.ticketUrl ?? ""}
          />
        </Field>
      </FieldGroup>

      {state.error && <FieldError>{state.error}</FieldError>}

      <PublishingControls
        mode={mode}
        initialStatus={values.status}
        publishAt={values.publishAt ?? ""}
        pending={pending}
      />
    </form>
  );
}
