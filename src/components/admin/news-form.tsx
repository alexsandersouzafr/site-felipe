"use client";

import { useActionState } from "react";

import type { EditorialActionState } from "@/app/admin/(protected)/noticias/actions";
import { PublishingControls } from "@/components/admin/publishing-fields";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ContentStatus } from "@/lib/content-visibility";
import type { RichTextDocument } from "@/lib/rich-text";

type NewsFormProps = {
  action: (
    prev: EditorialActionState,
    formData: FormData,
  ) => Promise<EditorialActionState>;
  initialValues?: {
    status?: ContentStatus;
    publishAt?: string;
    slug?: string;
    titlePt?: string;
    titleEn?: string | null;
    titleEs?: string | null;
    excerptPt?: string;
    excerptEn?: string | null;
    excerptEs?: string | null;
    contentPt?: RichTextDocument | null;
    contentEn?: RichTextDocument | null;
    contentEs?: RichTextDocument | null;
    coverImagePath?: string | null;
  };
  mode: "create" | "edit";
};

export function NewsForm({ action, initialValues, mode }: NewsFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-8">
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="titlePt">Título (PT)</FieldLabel>
            <Input
              id="titlePt"
              name="titlePt"
              required
              defaultValue={initialValues?.titlePt ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <Input
              id="slug"
              name="slug"
              placeholder="gerado-do-titulo"
              defaultValue={initialValues?.slug ?? ""}
            />
          </Field>
        </div>
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
        <Field>
          <FieldLabel htmlFor="excerptPt">Resumo (PT)</FieldLabel>
          <Textarea
            id="excerptPt"
            name="excerptPt"
            required
            defaultValue={initialValues?.excerptPt ?? ""}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="excerptEn">Resumo (EN)</FieldLabel>
            <Textarea
              id="excerptEn"
              name="excerptEn"
              defaultValue={initialValues?.excerptEn ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="excerptEs">Resumo (ES)</FieldLabel>
            <Textarea
              id="excerptEs"
              name="excerptEs"
              defaultValue={initialValues?.excerptEs ?? ""}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="coverImagePath">Caminho da capa</FieldLabel>
          <Input
            id="coverImagePath"
            name="coverImagePath"
            placeholder="photos/capa.jpg"
            defaultValue={initialValues?.coverImagePath ?? ""}
          />
        </Field>
        <RichTextEditor
          name="contentPt"
          label="Corpo (PT)"
          initialContent={initialValues?.contentPt}
        />
        <RichTextEditor
          name="contentEn"
          label="Corpo (EN)"
          initialContent={initialValues?.contentEn}
        />
        <RichTextEditor
          name="contentEs"
          label="Corpo (ES)"
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
