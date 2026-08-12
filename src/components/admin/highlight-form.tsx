"use client";

import { useActionState } from "react";

import type { EditorialActionState } from "@/app/admin/(protected)/noticias/actions";
import { PublishingControls } from "@/components/admin/publishing-fields";
import { ShowOnPageField } from "@/components/admin/show-on-page-field";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MAX_BIO_PAGE_HIGHLIGHTS } from "@/lib/bio-page";
import type { ContentStatus } from "@/lib/content-visibility";

export function HighlightForm({
  action,
  initialValues,
  mode,
  onPageCount = 0,
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
    descriptionPt?: string;
    descriptionEn?: string | null;
    descriptionEs?: string | null;
    displayOrder?: number;
  };
  mode: "create" | "edit";
  onPageCount?: number;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const slotsLabel = initialValues?.showOnPage
    ? `${onPageCount}/${MAX_BIO_PAGE_HIGHLIGHTS} destaques na página (incluindo este).`
    : `${onPageCount}/${MAX_BIO_PAGE_HIGHLIGHTS} destaques na página.`;

  return (
    <form action={formAction} className="space-y-8">
      <FieldGroup>
        <ShowOnPageField
          defaultSelected={initialValues?.showOnPage}
          help={`Até ${MAX_BIO_PAGE_HIGHLIGHTS} destaques aparecem na biografia. ${slotsLabel}`}
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
        <Field>
          <FieldLabel htmlFor="descriptionPt">Descrição (PT)</FieldLabel>
          <Textarea
            id="descriptionPt"
            name="descriptionPt"
            required
            defaultValue={initialValues?.descriptionPt ?? ""}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="descriptionEn">Descrição (EN)</FieldLabel>
            <Textarea
              id="descriptionEn"
              name="descriptionEn"
              defaultValue={initialValues?.descriptionEn ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="descriptionEs">Descrição (ES)</FieldLabel>
            <Textarea
              id="descriptionEs"
              name="descriptionEs"
              defaultValue={initialValues?.descriptionEs ?? ""}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="displayOrder">Ordem</FieldLabel>
          <Input
            id="displayOrder"
            name="displayOrder"
            type="number"
            defaultValue={initialValues?.displayOrder ?? 0}
          />
        </Field>
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
