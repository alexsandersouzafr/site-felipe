"use client";

import { useActionState } from "react";

import type { EditorialActionState } from "@/app/admin/(protected)/noticias/actions";
import { PublishingControls } from "@/components/admin/publishing-fields";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ShowOnPageField } from "@/components/admin/show-on-page-field";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ContentStatus } from "@/lib/content-visibility";
import type { RichTextDocument } from "@/lib/rich-text";

export function BiographyForm({
  action,
  initialValues,
  mode,
}: {
  action: (
    prev: EditorialActionState,
    formData: FormData,
  ) => Promise<EditorialActionState>;
  initialValues?: {
    status?: ContentStatus;
    publishAt?: string;
    showOnPage?: boolean;
    titlePt?: string;
    titleEn?: string | null;
    titleEs?: string | null;
    contentPt?: RichTextDocument | null;
    contentEn?: RichTextDocument | null;
    contentEs?: RichTextDocument | null;
  };
  mode: "create" | "edit";
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-8">
      <FieldGroup>
        <ShowOnPageField
          defaultSelected={initialValues?.showOnPage}
          help="Só uma biografia pode aparecer no site. Ativar esta remove a seleção anterior."
        />
        <Field>
          <FieldLabel htmlFor="titlePt">Título (PT)</FieldLabel>
          <Input
            id="titlePt"
            name="titlePt"
            required
            defaultValue={initialValues?.titlePt ?? ""}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="titleEn">Título (EN)</FieldLabel>
            <Input
              id="titleEn"
              name="titleEn"
              defaultValue={initialValues?.titleEn ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="titleEs">Título (ES)</FieldLabel>
            <Input
              id="titleEs"
              name="titleEs"
              defaultValue={initialValues?.titleEs ?? ""}
            />
          </Field>
        </div>
        <RichTextEditor
          name="contentPt"
          label="Biografia (PT)"
          initialContent={initialValues?.contentPt}
        />
        <RichTextEditor
          name="contentEn"
          label="Biografia (EN)"
          initialContent={initialValues?.contentEn}
        />
        <RichTextEditor
          name="contentEs"
          label="Biografia (ES)"
          initialContent={initialValues?.contentEs}
        />
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
