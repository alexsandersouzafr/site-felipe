"use client";

import { FloppyDiskIcon } from "@phosphor-icons/react";
import { useActionState, useState } from "react";

import type { HomeMediaActionState } from "@/app/admin/(protected)/home-fotos/actions";
import { ImageFocusField } from "@/components/admin/image-focus-field";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { HOME_PHOTO_SLOTS, type HomePhotoSlot } from "@/lib/home-photo-slots";
import { DEFAULT_IMAGE_FOCUS } from "@/lib/image-focus";
import { MAX_HD_IMAGE_MB } from "@/lib/media-limits";

export type HomePhotoSlotValue = {
  storagePath: string | null;
  altPt: string;
  altEn: string | null;
  altEs: string | null;
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

  const missingBands = HOME_PHOTO_SLOTS.filter(
    (slot) =>
      slot.key !== "hero" &&
      (!initialSlots[slot.key].storagePath || cleared[slot.key]),
  );

  return (
    <form
      action={formAction}
      className="space-y-8"
      encType="multipart/form-data"
    >
      <FieldDescription>
        Defina a capa/hero da home e as faixas de imagem entre as seções (fundo
        quase fixo com GSAP, sem sobreposição). Uploads em alta definição, até{" "}
        {MAX_HD_IMAGE_MB} MB. As capas das outras páginas ficam em Capas.
      </FieldDescription>

      {missingBands.length > 0 ? (
        <p
          className="rounded-2xl border border-border/80 bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
          role="status"
        >
          Ainda sem faixa entre seções na home:{" "}
          {missingBands.map((slot) => slot.label).join(", ")}. Envie a imagem,
          preencha o texto alternativo em PT e salve este formulário.
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
                id={`file_${slot.key}`}
                name={`file_${slot.key}`}
                label="Imagem"
                existingPath={isCleared ? null : values.storagePath}
                existingPathFieldName={`existing_${slot.key}`}
                description={`JPEG, PNG, WebP ou GIF. Máximo ${MAX_HD_IMAGE_MB} MB.`}
                onFileChange={(file) =>
                  setPendingFiles((current) => ({
                    ...current,
                    [slot.key]: Boolean(file),
                  }))
                }
              />

              <ImageFocusField
                id={`focus_${slot.key}`}
                name={`focus_${slot.key}`}
                defaultValue={values.objectPosition || DEFAULT_IMAGE_FOCUS}
              />

              <Field>
                <FieldLabel htmlFor={`altPt_${slot.key}`} required>
                  Texto alternativo (PT)
                </FieldLabel>
                <Input
                  id={`altPt_${slot.key}`}
                  name={`altPt_${slot.key}`}
                  defaultValue={values.altPt}
                  required={
                    !isCleared &&
                    (Boolean(values.storagePath) || pendingFiles[slot.key])
                  }
                  placeholder="Obrigatório ao publicar a faixa"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`altEn_${slot.key}`}>
                    Texto alternativo (EN)
                  </FieldLabel>
                  <Input
                    id={`altEn_${slot.key}`}
                    name={`altEn_${slot.key}`}
                    defaultValue={values.altEn ?? ""}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`altEs_${slot.key}`}>
                    Texto alternativo (ES)
                  </FieldLabel>
                  <Input
                    id={`altEs_${slot.key}`}
                    name={`altEs_${slot.key}`}
                    defaultValue={values.altEs ?? ""}
                  />
                </Field>
              </div>

              <input
                type="hidden"
                name={`clear_${slot.key}`}
                value={isCleared ? "true" : "false"}
              />

              {values.storagePath && !isCleared ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onPress={() =>
                    setCleared((current) => ({
                      ...current,
                      [slot.key]: true,
                    }))
                  }
                >
                  Remover faixa
                </Button>
              ) : null}
            </div>
          );
        })}
      </FieldGroup>

      {state.error ? <FieldError>{state.error}</FieldError> : null}
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
