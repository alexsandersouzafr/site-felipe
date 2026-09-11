"use client";

import { useActionState, useState } from "react";

import type { MediaActionState } from "@/app/admin/(protected)/fotos/actions";
import { PublishingControls } from "@/components/admin/publishing-fields";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    <form action={formAction} className="space-y-8">
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
                    <div className="mt-3 overflow-hidden rounded-2xl border border-border/80 bg-muted/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                        alt="Pré-visualização do vídeo"
                        className="aspect-video w-full max-w-sm object-cover"
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
                  <FieldLabel htmlFor="titleFr">Título (FR)</FieldLabel>
                  <Input
                    id="titleFr"
                    name="titleFr"
                    defaultValue={initialValues?.titleFr ?? ""}
                  />
                </Field>
              </div>

              {schedule}

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
                  <FieldLabel htmlFor="descriptionEn">
                    Descrição (EN)
                  </FieldLabel>
                  <Textarea
                    id="descriptionEn"
                    name="descriptionEn"
                    defaultValue={initialValues?.descriptionEn ?? ""}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="descriptionFr">
                    Descrição (FR)
                  </FieldLabel>
                  <Textarea
                    id="descriptionFr"
                    name="descriptionFr"
                    defaultValue={initialValues?.descriptionFr ?? ""}
                  />
                </Field>
              </div>
            </FieldGroup>
            {state.error && <FieldError>{state.error}</FieldError>}
            {actions}
          </>
        )}
      </PublishingControls>
    </form>
  );
}
