"use client";

import { useActionState } from "react";

import type { EditorialActionState } from "@/app/admin/(protected)/editorial/actions";
import { LocalizedField } from "@/components/admin/localized-field";
import { PublishingControls } from "@/components/admin/publishing-fields";
import { ShowOnPageField } from "@/components/admin/show-on-page-field";
import { FieldError, FieldGroup } from "@/components/ui/field";
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
    titleFr?: string | null;
    descriptionPt?: string;
    descriptionEn?: string | null;
    descriptionFr?: string | null;
  };
  mode: "create" | "edit";
  onPageCount?: number;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const slotsLabel = initialValues?.showOnPage
    ? `${onPageCount}/${MAX_BIO_PAGE_HIGHLIGHTS} destaques na página (incluindo este).`
    : `${onPageCount}/${MAX_BIO_PAGE_HIGHLIGHTS} destaques na página.`;

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
              <ShowOnPageField
                defaultSelected={initialValues?.showOnPage}
                help={`Até ${MAX_BIO_PAGE_HIGHLIGHTS} destaques aparecem na biografia. ${slotsLabel}`}
              />
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

              <LocalizedField
                label="Descrição"
                required
                multiline
                names={{
                  pt: "descriptionPt",
                  en: "descriptionEn",
                  fr: "descriptionFr",
                }}
                defaultValues={{
                  pt: initialValues?.descriptionPt,
                  en: initialValues?.descriptionEn,
                  fr: initialValues?.descriptionFr,
                }}
              />
            </FieldGroup>
            {state.error && <FieldError>{state.error}</FieldError>}
            {actions}
          </>
        )}
      </PublishingControls>
    </form>
  );
}
