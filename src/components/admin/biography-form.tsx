"use client";

import { FloppyDiskIcon } from "@phosphor-icons/react";
import { useActionState } from "react";

import type { EditorialActionState } from "@/app/admin/(protected)/editorial/actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { LocalizedRichTextEditor } from "@/components/admin/localized-rich-text-editor";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { MAX_BLOG_IMAGE_MB } from "@/lib/media-limits";
import type { RichTextDocument } from "@/lib/rich-text";

export function BiographyForm({
  action,
  initialValues,
}: {
  action: (
    prev: EditorialActionState,
    formData: FormData,
  ) => Promise<EditorialActionState>;
  initialValues?: {
    imagePath?: string | null;
    summaryPt?: string;
    summaryEn?: string | null;
    summaryEs?: string | null;
    contentPt?: RichTextDocument | null;
    contentEn?: RichTextDocument | null;
    contentEs?: RichTextDocument | null;
  };
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-8">
      <FieldGroup>
        <ImageUploadField
          id="imageFile"
          name="imageFile"
          label="Imagem no topo"
          existingPath={initialValues?.imagePath}
          existingPathFieldName="imagePath"
          description={`JPEG, PNG, WebP ou GIF. Máximo ${MAX_BLOG_IMAGE_MB} MB.`}
        />

        <Field>
          <FieldLabel htmlFor="summaryPt" required>
            Resumo para a home (PT)
          </FieldLabel>
          <Textarea
            id="summaryPt"
            name="summaryPt"
            required
            rows={4}
            defaultValue={initialValues?.summaryPt ?? ""}
          />
          <FieldDescription>
            Texto curto exibido na página inicial. EN/ES são opcionais.
          </FieldDescription>
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="summaryEn">Resumo (EN)</FieldLabel>
            <Textarea
              id="summaryEn"
              name="summaryEn"
              rows={4}
              defaultValue={initialValues?.summaryEn ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="summaryEs">Resumo (ES)</FieldLabel>
            <Textarea
              id="summaryEs"
              name="summaryEs"
              rows={4}
              defaultValue={initialValues?.summaryEs ?? ""}
            />
          </Field>
        </div>

        <LocalizedRichTextEditor
          label="Biografia"
          required
          names={{
            pt: "contentPt",
            en: "contentEn",
            es: "contentEs",
          }}
          values={{
            pt: initialValues?.contentPt ?? null,
            en: initialValues?.contentEn ?? null,
            es: initialValues?.contentEs ?? null,
          }}
        />
      </FieldGroup>

      {state.error ? <FieldError>{state.error}</FieldError> : null}

      <Button type="submit" isDisabled={pending}>
        <FloppyDiskIcon className="size-4" data-icon="inline-start" />
        {pending ? "Salvando..." : "Salvar biografia"}
      </Button>
    </form>
  );
}
