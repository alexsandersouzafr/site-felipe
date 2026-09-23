"use client";

import { useActionState } from "react";

import type { BlogActionState } from "@/app/admin/(protected)/blog/actions";
import { BlogBlocksEditor } from "@/components/admin/blog-blocks-editor";
import {
  CoverImageField,
  type CoverLibraryItem,
} from "@/components/admin/cover-image-field";
import { FormFeedback } from "@/components/admin/form-feedback";
import { LocalizedField } from "@/components/admin/localized-field";
import { PublishingControls } from "@/components/admin/publishing-fields";
import { useAdminToast } from "@/components/admin/toast";
import { FieldGroup } from "@/components/ui/field";
import type { BlogBlock } from "@/lib/blog-blocks";
import type { ContentStatus } from "@/lib/content-visibility";
import { validateRequestSize } from "@/lib/media-limits";

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
    titleFr?: string | null;
    blocks?: BlogBlock[];
    coverImagePath?: string | null;
  };
  mode: "create" | "edit";
  coverLibrary: CoverLibraryItem[];
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const toast = useAdminToast();

  return (
    <form
      action={formAction}
      className="max-w-4xl space-y-8"
      // A post sends its cover and every image block at once: each file can be
      // within its own limit while the request is too large to be accepted,
      // and that refusal happens before the action can report it.
      onSubmit={(event) => {
        const total = validateRequestSize(new FormData(event.currentTarget));

        if (!total.ok) {
          event.preventDefault();
          toast({ tone: "error", message: total.error });
        }
      }}
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
              <LocalizedField
                label="Título"
                required
                names={{ pt: "titlePt", en: "titleEn", fr: "titleFr" }}
                defaultValues={{
                  pt: initialValues?.titlePt,
                  en: initialValues?.titleEn,
                  fr: initialValues?.titleFr,
                }}
              />

              {schedule}

              <CoverImageField
                initialPath={initialValues?.coverImagePath}
                library={coverLibrary}
              />

              <BlogBlocksEditor initialBlocks={initialValues?.blocks} />
            </FieldGroup>

            <FormFeedback state={state} />

            {actions}
          </>
        )}
      </PublishingControls>
    </form>
  );
}
