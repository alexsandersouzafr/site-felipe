"use client";

import { useActionState } from "react";

import type { BlogActionState } from "@/app/admin/(protected)/blog/actions";
import { BlogBlocksEditor } from "@/components/admin/blog-blocks-editor";
import {
  CoverImageField,
  type CoverLibraryItem,
} from "@/components/admin/cover-image-field";
import { PublishingControls } from "@/components/admin/publishing-fields";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { BlogBlock } from "@/lib/blog-blocks";
import type { ContentStatus } from "@/lib/content-visibility";

export function BlogPostForm({
  action,
  initialValues,
  mode,
  coverLibrary,
}: {
  action: (
    prev: BlogActionState,
    formData: FormData,
  ) => Promise<BlogActionState>;
  initialValues?: {
    status?: ContentStatus;
    publishAt?: string;
    titlePt?: string;
    titleEn?: string | null;
    titleEs?: string | null;
    blocks?: BlogBlock[];
    coverImagePath?: string | null;
  };
  mode: "create" | "edit";
  coverLibrary: CoverLibraryItem[];
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
              <div className="grid gap-4 md:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="titlePt" required>
                    Título (PT)
                  </FieldLabel>
                  <Input
                    id="titlePt"
                    name="titlePt"
                    required
                    defaultValue={initialValues?.titlePt ?? ""}
                  />
                </Field>
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

              {schedule}

              <CoverImageField
                initialPath={initialValues?.coverImagePath}
                library={coverLibrary}
              />

              <BlogBlocksEditor initialBlocks={initialValues?.blocks} />
            </FieldGroup>

            {state.error && <FieldError>{state.error}</FieldError>}

            {actions}
          </>
        )}
      </PublishingControls>
    </form>
  );
}
