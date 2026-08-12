"use client";

import { FloppyDiskIcon } from "@phosphor-icons/react";
import { useActionState, useState } from "react";

import type { PageCoverActionState } from "@/app/admin/(protected)/capas/actions";
import { ImageFocusField } from "@/components/admin/image-focus-field";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import {
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { DEFAULT_IMAGE_FOCUS } from "@/lib/image-focus";
import { MAX_HD_IMAGE_MB } from "@/lib/media-limits";
import { type AdminPageCoverKey, PAGE_COVER_LABELS } from "@/lib/page-covers";

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

  return (
    <form
      action={formAction}
      className="space-y-8"
      encType="multipart/form-data"
    >
      <FieldDescription>
        Capa em alta definição (até {MAX_HD_IMAGE_MB} MB) para o topo da página{" "}
        {PAGE_COVER_LABELS[pageKey]}. Ajuste o enquadramento para preservar
        rostos e pontos importantes.
      </FieldDescription>

      <FieldGroup className="gap-6">
        <ImageUploadField
          id="file"
          name="file"
          label="Arquivo"
          existingPath={cleared ? null : initialCover.storagePath}
          existingPathFieldName="existing"
          description="JPEG, PNG, WebP ou GIF em alta definição."
        />
        <ImageFocusField
          id="focus"
          name="focus"
          defaultValue={initialCover.objectPosition || DEFAULT_IMAGE_FOCUS}
        />
        <input type="hidden" name="clear" value={cleared ? "true" : "false"} />
        {initialCover.storagePath && !cleared ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onPress={() => setCleared(true)}
          >
            Remover capa
          </Button>
        ) : null}
      </FieldGroup>

      {state.error ? <FieldError>{state.error}</FieldError> : null}
      {state.success ? (
        <p className="text-sm text-foreground" role="status">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" isDisabled={pending}>
        <FloppyDiskIcon className="size-4" data-icon="inline-start" />
        {pending ? "Salvando..." : "Salvar capa"}
      </Button>
    </form>
  );
}
