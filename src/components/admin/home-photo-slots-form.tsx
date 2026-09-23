"use client";

import { FloppyDiskIcon } from "@phosphor-icons/react";
import { useActionState, useEffect, useState } from "react";

import type { HomeMediaActionState } from "@/app/admin/(protected)/home-fotos/actions";
import { FormFeedback } from "@/components/admin/form-feedback";
import { ImageFocusField } from "@/components/admin/image-focus-field";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { LocalizedField } from "@/components/admin/localized-field";
import { useAdminToast } from "@/components/admin/toast";
import { Button } from "@/components/ui/button";
import {
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { HOME_PHOTO_SLOTS, type HomePhotoSlot } from "@/lib/home-photo-slots";
import { DEFAULT_IMAGE_FOCUS } from "@/lib/image-focus";
import {
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MB,
  validateRequestSize,
} from "@/lib/media-limits";

export type HomePhotoSlotValue = {
  storagePath: string | null;
  altPt: string;
  altEn: string | null;
  altFr: string | null;
  objectPosition: string;
};

export function HomePhotoSlotsForm({
  action,
  initialSlots,
}: {
  action: (
    prev: HomeMediaActionState,
    formData: FormData,
  ) => Promise<HomeMediaActionState>;
  initialSlots: Record<HomePhotoSlot, HomePhotoSlotValue>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const toast = useAdminToast();
  const [cleared, setCleared] = useState<Record<HomePhotoSlot, boolean>>(
    () =>
      Object.fromEntries(
        HOME_PHOTO_SLOTS.map((slot) => [slot.key, false]),
      ) as Record<HomePhotoSlot, boolean>,
  );
  const [pendingFiles, setPendingFiles] = useState<
    Record<HomePhotoSlot, boolean>
  >(
    () =>
      Object.fromEntries(
        HOME_PHOTO_SLOTS.map((slot) => [slot.key, false]),
      ) as Record<HomePhotoSlot, boolean>,
  );

  // What is stored now; when it changes, a save went through and the pending
  // removals it carried are done.
  const savedPaths = HOME_PHOTO_SLOTS.map(
    (slot) => initialSlots[slot.key].storagePath ?? "",
  ).join("|");

  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the saved paths, not on the maps it resets
  useEffect(() => {
    const allFalse = Object.fromEntries(
      HOME_PHOTO_SLOTS.map((slot) => [slot.key, false]),
    ) as Record<HomePhotoSlot, boolean>;

    setCleared(allFalse);
    setPendingFiles(allFalse);
  }, [savedPaths]);

  const missingSlots = HOME_PHOTO_SLOTS.filter(
    (slot) => !initialSlots[slot.key].storagePath || cleared[slot.key],
  );

  return (
    <form
      action={formAction}
      className="max-w-4xl space-y-8"
      // This form sends up to three images at once: each can be inside its
      // own limit while the request is too large to be accepted.
      onSubmit={(event) => {
        const total = validateRequestSize(new FormData(event.currentTarget));

        if (!total.ok) {
          event.preventDefault();
          toast({ tone: "error", message: total.error });
        }
      }}
    >
      <FieldDescription>
        As imagens grandes da página inicial: a foto de abertura, no topo, e as
        que aparecem entre os blocos de texto. Use fotos de boa qualidade, de
        até {MAX_IMAGE_MB} MB cada. As imagens de topo das outras páginas ficam
        em Capas.
      </FieldDescription>

      {missingSlots.length > 0 ? (
        <p
          className="rounded-2xl border border-border/80 bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
          role="status"
        >
          Ainda sem imagem: {missingSlots.map((slot) => slot.label).join(", ")}.
          Escolha a foto, escreva a descrição em português e salve.
        </p>
      ) : null}

      <FieldGroup className="gap-8">
        {HOME_PHOTO_SLOTS.map((slot) => {
          const values = initialSlots[slot.key];
          const isCleared = cleared[slot.key];

          return (
            <div
              key={slot.key}
              className="space-y-4 rounded-3xl border border-border/80 bg-muted/20 p-4"
            >
              <div>
                <FieldLabel>{slot.label}</FieldLabel>
                <FieldDescription>{slot.help}</FieldDescription>
              </div>

              <ImageUploadField
                maxBytes={MAX_IMAGE_BYTES}
                id={`file_${slot.key}`}
                name={`file_${slot.key}`}
                label="Imagem"
                existingPath={isCleared ? null : values.storagePath}
                existingPathFieldName={`existing_${slot.key}`}
                onRemove={() =>
                  setCleared((current) => ({ ...current, [slot.key]: true }))
                }
                description={`JPEG, PNG, WebP ou GIF. Máximo ${MAX_IMAGE_MB} MB.`}
                onFileChange={(file) => {
                  setPendingFiles((current) => ({
                    ...current,
                    [slot.key]: Boolean(file),
                  }));
                  if (file) {
                    setCleared((current) => ({
                      ...current,
                      [slot.key]: false,
                    }));
                  }
                }}
              />

              <ImageFocusField
                id={`focus_${slot.key}`}
                name={`focus_${slot.key}`}
                defaultValue={values.objectPosition || DEFAULT_IMAGE_FOCUS}
              />

              <LocalizedField
                label="Texto alternativo"
                required={
                  !isCleared &&
                  (Boolean(values.storagePath) || pendingFiles[slot.key])
                }
                names={{
                  pt: `altPt_${slot.key}`,
                  en: `altEn_${slot.key}`,
                  fr: `altFr_${slot.key}`,
                }}
                defaultValues={{
                  pt: values.altPt,
                  en: values.altEn,
                  fr: values.altFr,
                }}
                placeholder="Descreva a foto para quem não pode vê-la"
              />

              <input
                type="hidden"
                name={`clear_${slot.key}`}
                value={isCleared ? "true" : "false"}
              />

              {isCleared ? (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-muted-foreground" role="status">
                    Esta imagem sai da página ao salvar.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onPress={() =>
                      setCleared((current) => ({
                        ...current,
                        [slot.key]: false,
                      }))
                    }
                  >
                    Desfazer
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </FieldGroup>

      <FormFeedback state={state} />
      {state.success ? (
        <p className="text-sm text-foreground" role="status">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" isDisabled={pending}>
        <FloppyDiskIcon className="size-4" data-icon="inline-start" />
        {pending ? "Salvando..." : "Salvar fotos da home"}
      </Button>
    </form>
  );
}
