"use client";

import { useActionState } from "react";

import type { MediaActionState } from "@/app/admin/(protected)/fotos/actions";
import { PublishingControls } from "@/components/admin/publishing-fields";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ContentStatus } from "@/lib/content-visibility";

export function PhotoForm({
  action,
  initialValues,
  mode,
}: {
  action: (
    prev: MediaActionState,
    formData: FormData,
  ) => Promise<MediaActionState>;
  initialValues?: {
    status?: ContentStatus;
    publishAt?: string;
    storagePath?: string;
    altPt?: string;
    altEn?: string | null;
    altEs?: string | null;
    credit?: string | null;
    collection?: string | null;
    displayOrder?: number;
  };
  mode: "create" | "edit";
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="space-y-8"
      encType="multipart/form-data"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="file">Arquivo</FieldLabel>
          <Input id="file" name="file" type="file" accept="image/*" />
          {initialValues?.storagePath && (
            <p className="mt-1 text-xs text-muted-foreground">
              Atual: {initialValues.storagePath}
            </p>
          )}
          <input
            type="hidden"
            name="storagePath"
            value={initialValues?.storagePath ?? ""}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="altPt">Texto alternativo (PT)</FieldLabel>
          <Input
            id="altPt"
            name="altPt"
            required
            defaultValue={initialValues?.altPt ?? ""}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="altEn">Texto alternativo (EN)</FieldLabel>
            <Input
              id="altEn"
              name="altEn"
              defaultValue={initialValues?.altEn ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="altEs">Texto alternativo (ES)</FieldLabel>
            <Input
              id="altEs"
              name="altEs"
              defaultValue={initialValues?.altEs ?? ""}
            />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="credit">Crédito</FieldLabel>
            <Input
              id="credit"
              name="credit"
              defaultValue={initialValues?.credit ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="collection">Coleção</FieldLabel>
            <Input
              id="collection"
              name="collection"
              defaultValue={initialValues?.collection ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="displayOrder">Ordem</FieldLabel>
            <Input
              id="displayOrder"
              name="displayOrder"
              type="number"
              defaultValue={initialValues?.displayOrder ?? 0}
            />
          </Field>
        </div>
      </FieldGroup>
      {state.error && <FieldError>{state.error}</FieldError>}
      <PublishingControls
        mode={mode}
        initialStatus={initialValues?.status}
        publishAt={initialValues?.publishAt}
        pending={pending}
      />
    </form>
  );
}
