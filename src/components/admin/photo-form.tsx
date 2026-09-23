"use client";

import { useActionState } from "react";

import type { MediaActionState } from "@/app/admin/(protected)/fotos/actions";
import { FormFeedback } from "@/components/admin/form-feedback";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { LocalizedField } from "@/components/admin/localized-field";
import { PublishingControls } from "@/components/admin/publishing-fields";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
    altFr?: string | null;
    credit?: string | null;
    collection?: string | null;
  };
  mode: "create" | "edit";
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      <PublishingControls
        mode={mode}
        initialStatus={initialValues?.status}
        publishAt={initialValues?.publishAt}
        pending={pending}
      >
        {({ schedule, actions }) => (
          <>
            <FieldGroup>
              <ImageUploadField
                id="file"
                name="file"
                label="Arquivo"
                existingPath={initialValues?.storagePath}
                existingPathFieldName="storagePath"
                required={mode === "create"}
              />
              <LocalizedField
                label="Texto alternativo"
                required
                names={{ pt: "altPt", en: "altEn", fr: "altFr" }}
                defaultValues={{
                  pt: initialValues?.altPt,
                  en: initialValues?.altEn,
                  fr: initialValues?.altFr,
                }}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="credit">Crédito (opcional)</FieldLabel>
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
              </div>
              {schedule}
            </FieldGroup>
            <FormFeedback state={state} />
            {actions}
          </>
        )}
      </PublishingControls>
    </form>
  );
}
