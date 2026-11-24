"use client";

import { FloppyDiskIcon } from "@phosphor-icons/react";
import { useActionState, useEffect, useState } from "react";

import type { PageCoverActionState } from "@/app/admin/(protected)/capas/actions";
import { FormFeedback } from "@/components/admin/form-feedback";
import { ImageFramingField } from "@/components/admin/image-framing-field";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { submitKeepingValues } from "@/components/admin/submit-keeping-values";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { DEFAULT_IMAGE_FOCUS } from "@/lib/image-focus";
import { MAX_HD_IMAGE_BYTES, MAX_HD_IMAGE_MB } from "@/lib/media-limits";
import { type AdminPageCoverKey, PAGE_COVER_LABELS } from "@/lib/page-covers";
import { pageCoverFrames } from "@/lib/site-frames";

const COVER_FRAMES = pageCoverFrames();

export type PageCoverValue = {
  storagePath: string | null;
  objectPosition: string;
};

export function PageCoverForm({
  pageKey,
  action,
  initialCover,
}: {
  pageKey: AdminPageCoverKey;
  action: (
    prev: PageCoverActionState,
    formData: FormData,
  ) => Promise<PageCoverActionState>;
  initialCover: PageCoverValue;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [cleared, setCleared] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // The saved cover changed, so whatever was pending has already happened.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the path is the trigger, not something the body reads
  useEffect(() => {
    setCleared(false);
  }, [initialCover.storagePath]);

  return (
    <form
      onSubmit={(event) => submitKeepingValues(event, formAction)}
      className="max-w-3xl space-y-8"
    >
      <FieldDescription>
        Imagem do topo da página {PAGE_COVER_LABELS[pageKey]}, de até{" "}
        {MAX_HD_IMAGE_MB} MB. Ajuste o enquadramento para não cortar rostos nem
        pontos importantes. Sem imagem, a página abre com um fundo em degradê.
      </FieldDescription>

      <FieldGroup className="gap-6">
        <ImageUploadField
          maxBytes={MAX_HD_IMAGE_BYTES}
          id="file"
          name="file"
          label="Arquivo"
          existingPath={cleared ? null : initialCover.storagePath}
          existingPathFieldName="existing"
          onRemove={() => setCleared(true)}
          onPreviewChange={setPreview}
          onFileChange={(file) => {
            // Picking a replacement is the opposite of removing: whichever
            // came last is what the person means.
            if (file) {
              setCleared(false);
            }
          }}
          description="JPEG, PNG, WebP ou GIF em alta definição."
        />
        <ImageFramingField
          id="focus"
          name="focus"
          defaultValue={initialCover.objectPosition || DEFAULT_IMAGE_FOCUS}
          src={preview}
          frames={COVER_FRAMES}
        />
        <input type="hidden" name="clear" value={cleared ? "true" : "false"} />
        {cleared ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground" role="status">
              Esta imagem sai da página ao salvar.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onPress={() => setCleared(false)}
            >
              Desfazer
            </Button>
          </div>
        ) : null}
      </FieldGroup>

      <FormFeedback state={state} />
      <Button type="submit" isPending={pending}>
        <FloppyDiskIcon className="size-4" data-icon="inline-start" />
        {pending ? "Salvando..." : "Salvar capa"}
      </Button>
    </form>
  );
}
