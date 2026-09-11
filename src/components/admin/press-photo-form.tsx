"use client";

import { useActionState } from "react";

import type { PressPhotoActionState } from "@/app/admin/(protected)/imprensa/actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { PublishingControls } from "@/components/admin/publishing-fields";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ContentStatus } from "@/lib/content-visibility";
import { MAX_HD_IMAGE_MB } from "@/lib/media-limits";

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
    altPt?: string;
    altEn?: string | null;
    altFr?: string | null;
    credit?: string | null;
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
                description={`Alta resolução. JPEG, PNG, WebP ou GIF. Máximo ${MAX_HD_IMAGE_MB} MB.`}
              />
              <Field>
                <FieldLabel htmlFor="altPt" required>
                  Texto alternativo (PT)
                </FieldLabel>
                <Input
                  id="altPt"
                  name="altPt"
                  required
                  defaultValue={initialValues?.altPt ?? ""}
                />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="altEn">
                    Texto alternativo (EN)
                  </FieldLabel>
                  <Input
                    id="altEn"
                    name="altEn"
                    defaultValue={initialValues?.altEn ?? ""}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="altFr">
                    Texto alternativo (FR)
                  </FieldLabel>
                  <Input
                    id="altFr"
                    name="altFr"
                    defaultValue={initialValues?.altFr ?? ""}
                  />
                </Field>
              </div>

              {schedule}

              <Field>
                <FieldLabel htmlFor="credit">Crédito</FieldLabel>
                <Input
                  id="credit"
                  name="credit"
                  defaultValue={initialValues?.credit ?? ""}
                />
              </Field>
            </FieldGroup>
            {state.error && <FieldError>{state.error}</FieldError>}
            {actions}
          </>
        )}
      </PublishingControls>
    </form>
  );
}
