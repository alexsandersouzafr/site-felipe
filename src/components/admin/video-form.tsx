"use client";

import Image from "next/image";
import { useActionState, useState } from "react";

import type { MediaActionState } from "@/app/admin/(protected)/fotos/actions";
import { FormFeedback } from "@/components/admin/form-feedback";
import { LocalizedField } from "@/components/admin/localized-field";
import { PublishingControls } from "@/components/admin/publishing-fields";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ContentStatus } from "@/lib/content-visibility";
import { extractYouTubeId } from "@/lib/youtube";

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
    titleFr?: string | null;
    descriptionPt?: string | null;
    descriptionEn?: string | null;
    descriptionFr?: string | null;
  };
  mode: "create" | "edit";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [youtubeUrl, setYoutubeUrl] = useState(initialValues?.youtubeUrl ?? "");
  const youtubeId = extractYouTubeId(youtubeUrl.trim());

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
              <Field>
                <FieldLabel htmlFor="youtubeUrl" required>
                  URL do YouTube
                </FieldLabel>
                <Input
                  id="youtubeUrl"
                  name="youtubeUrl"
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                />
                {youtubeUrl.trim() ? (
                  youtubeId ? (
                    <div className="relative mt-3 aspect-video w-full max-w-sm overflow-hidden rounded-2xl border border-border/80 bg-muted/30">
                      <Image
                        src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
                        alt="Pré-visualização do vídeo"
                        fill
                        sizes="384px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <FieldDescription className="text-destructive">
                      Não foi possível reconhecer essa URL como um vídeo do
                      YouTube.
                    </FieldDescription>
                  )
                ) : null}
              </Field>
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

              <LocalizedField
                label="Descrição"
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
              {schedule}
            </FieldGroup>
            <FormFeedback state={state} />
            {actions}
          </>
        )}
      </PublishingControls>
    </form>
  );
}
