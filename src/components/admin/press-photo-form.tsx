"use client";

import { useActionState } from "react";

import type { PressPhotoActionState } from "@/app/admin/(protected)/imprensa/actions";
import { FormFeedback } from "@/components/admin/form-feedback";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { LocalizedField } from "@/components/admin/localized-field";
import { PublishingControls } from "@/components/admin/publishing-fields";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ContentStatus } from "@/lib/content-visibility";
import { MAX_PRESS_IMAGE_BYTES, MAX_PRESS_IMAGE_MB } from "@/lib/media-limits";
import {
  DEFAULT_PRESS_PHOTO_CATEGORY,
  PRESS_PHOTO_CATEGORIES,
  PRESS_PHOTO_CATEGORY_LABELS,
  type PressPhotoCategory,
} from "@/lib/press-categories";

export function PressPhotoForm({
  action,
  initialValues,
  mode,
}: {
  action: (
    prev: PressPhotoActionState,
    formData: FormData,
  ) => Promise<PressPhotoActionState>;
  initialValues?: {
    status?: ContentStatus;
    publishAt?: string;
    storagePath?: string;
    category?: PressPhotoCategory;
    altPt?: string;
    altEn?: string | null;
    altFr?: string | null;
    credit?: string | null;
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
              <fieldset className="space-y-2">
                <legend className="flex gap-1 text-sm font-medium">
                  Tipo de foto
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PRESS_PHOTO_CATEGORIES.map((category) => (
                    <label
                      key={category}
                      className="flex cursor-pointer flex-col gap-1 rounded-xl border border-border p-4 transition-colors hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/30"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        required
                        defaultChecked={
                          (initialValues?.category ??
                            DEFAULT_PRESS_PHOTO_CATEGORY) === category
                        }
                        className="sr-only"
                      />
                      <span className="font-medium">
                        {PRESS_PHOTO_CATEGORY_LABELS[category].label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {PRESS_PHOTO_CATEGORY_LABELS[category].description}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <ImageUploadField
                maxBytes={MAX_PRESS_IMAGE_BYTES}
                id="file"
                name="file"
                label="Arquivo"
                existingPath={initialValues?.storagePath}
                existingPathFieldName="storagePath"
                required={mode === "create"}
                description={`Alta resolução. JPEG, PNG, WebP ou GIF. Máximo ${MAX_PRESS_IMAGE_MB} MB — um JPEG de 4000 a 6000 px no lado maior, em qualidade alta, costuma caber.`}
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

              {schedule}

              <Field>
                <FieldLabel htmlFor="credit" required>
                  Crédito
                </FieldLabel>
                <Input
                  id="credit"
                  name="credit"
                  required
                  defaultValue={initialValues?.credit ?? ""}
                  placeholder="Nome do fotógrafo"
                />
                <FieldDescription>
                  Aparece como “© Nome” sob a foto na página de imprensa.
                </FieldDescription>
              </Field>
            </FieldGroup>
            <FormFeedback state={state} />
            {actions}
          </>
        )}
      </PublishingControls>
    </form>
  );
}
