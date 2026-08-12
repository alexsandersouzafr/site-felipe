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
import { Textarea } from "@/components/ui/textarea";
import type { ContentStatus } from "@/lib/content-visibility";

export function VideoForm({
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
    youtubeUrl?: string;
    titlePt?: string;
    titleEn?: string | null;
    titleEs?: string | null;
    descriptionPt?: string | null;
    descriptionEn?: string | null;
    descriptionEs?: string | null;
    displayOrder?: number;
  };
  mode: "create" | "edit";
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-8">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="youtubeUrl">URL do YouTube</FieldLabel>
          <Input
            id="youtubeUrl"
            name="youtubeUrl"
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            defaultValue={initialValues?.youtubeUrl ?? ""}
          />
        </Field>
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
