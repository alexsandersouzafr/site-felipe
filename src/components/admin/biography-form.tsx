"use client";

import { FloppyDiskIcon } from "@phosphor-icons/react";
import { useActionState } from "react";

import type { EditorialActionState } from "@/app/admin/(protected)/editorial/actions";
import { LocalizedField } from "@/components/admin/localized-field";
import { LocalizedRichTextEditor } from "@/components/admin/localized-rich-text-editor";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
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
    summaryPt?: string;
    summaryEn?: string | null;
    summaryFr?: string | null;
    contentPt?: RichTextDocument | null;
    contentEn?: RichTextDocument | null;
    contentFr?: RichTextDocument | null;
  };
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      <FieldGroup>
        <LocalizedField
          label="Resumo para a home"
          required
          multiline
          rows={4}
          names={{ pt: "summaryPt", en: "summaryEn", fr: "summaryFr" }}
          defaultValues={{
            pt: initialValues?.summaryPt,
            en: initialValues?.summaryEn,
            fr: initialValues?.summaryFr,
          }}
          description="Texto curto exibido na página inicial. EN/FR são opcionais."
        />

        <LocalizedRichTextEditor
          label="Biografia"
          required
          names={{
            pt: "contentPt",
            en: "contentEn",
            fr: "contentFr",
          }}
          values={{
            pt: initialValues?.contentPt ?? null,
            en: initialValues?.contentEn ?? null,
            fr: initialValues?.contentFr ?? null,
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
