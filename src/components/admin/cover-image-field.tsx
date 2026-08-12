"use client";

import { CheckIcon, ImagesIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { ImagePreview } from "@/components/admin/image-upload-field";
import { SmoothReveal } from "@/components/admin/smooth-reveal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MAX_BLOG_IMAGE_MB } from "@/lib/media-limits";
import { mediaPublicUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";

export type CoverLibraryItem = {
  storagePath: string;
  label: string;
};

function readFileFromChange(event: unknown): File | null {
  if (
    event &&
    typeof event === "object" &&
    "target" in event &&
    event.target &&
    typeof event.target === "object" &&
    "files" in event.target
  ) {
    const files = event.target.files as FileList | null;
    return files?.[0] ?? null;
  }

  return null;
}

export function CoverImageField({
  initialPath = null,
  library,
}: {
  initialPath?: string | null;
  library: CoverLibraryItem[];
}) {
  const [mode, setMode] = useState<"upload" | "library">(
    initialPath && library.some((item) => item.storagePath === initialPath)
      ? "library"
      : "upload",
  );
  const [selectedPath, setSelectedPath] = useState(initialPath ?? "");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const previewSrc =
    mode === "upload"
      ? (localPreview ?? mediaPublicUrl(selectedPath))
      : mediaPublicUrl(selectedPath);

  const selectedLabel =
    library.find((item) => item.storagePath === selectedPath)?.label ?? null;

  return (
    <div className="space-y-4 rounded-3xl border border-border/80 bg-muted/20 p-4">
      <div className="space-y-1">
        <p className="text-sm font-bold">Imagem de capa</p>
        <FieldDescription>
          Envie uma nova imagem (até {MAX_BLOG_IMAGE_MB} MB) ou escolha uma já
          enviada na galeria de fotos.
        </FieldDescription>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "upload" ? "default" : "outline"}
          onPress={() => setMode("upload")}
        >
          <UploadSimpleIcon className="size-3.5" data-icon="inline-start" />
          Novo upload
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "library" ? "default" : "outline"}
          onPress={() => {
            setMode("library");
            setLocalPreview((previous) => {
              if (previous) {
                URL.revokeObjectURL(previous);
              }
              return null;
            });
            setGalleryOpen(true);
          }}
        >
          <ImagesIcon className="size-3.5" data-icon="inline-start" />
          Usar imagem carregada anteriormente
        </Button>
      </div>

      <div>
        <SmoothReveal open={mode === "upload"}>
          <Field>
            <FieldLabel htmlFor="coverFile">Arquivo da capa</FieldLabel>
            <Input
              id="coverFile"
              name={mode === "upload" ? "coverFile" : undefined}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              tabIndex={mode === "upload" ? undefined : -1}
              onChange={(event) => {
                const file = readFileFromChange(event);
                setLocalPreview((previous) => {
                  if (previous) {
                    URL.revokeObjectURL(previous);
                  }
                  return file ? URL.createObjectURL(file) : null;
                });
              }}
            />
            {mode === "upload" ? (
              <input type="hidden" name="coverImagePath" value={selectedPath} />
            ) : null}
          </Field>
        </SmoothReveal>

        <SmoothReveal open={mode === "library"}>
          <Field>
            <FieldLabel>Imagem da galeria</FieldLabel>
            {selectedPath ? (
              <p className="text-sm text-muted-foreground">
                Selecionada:{" "}
                <span className="font-medium text-foreground">
                  {selectedLabel ?? selectedPath}
                </span>
              </p>
            ) : (
              <FieldDescription>
                Nenhuma imagem selecionada. Abra a galeria para escolher.
              </FieldDescription>
            )}
            {mode === "library" ? (
              <input type="hidden" name="coverImagePath" value={selectedPath} />
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2 w-fit"
              isDisabled={mode !== "library"}
              onPress={() => setGalleryOpen(true)}
            >
              <ImagesIcon className="size-3.5" data-icon="inline-start" />
              Usar imagem carregada anteriormente
            </Button>
          </Field>
        </SmoothReveal>
      </div>

      <ImagePreview src={previewSrc} alt="Pré-visualização da capa" />

      <Dialog
        isOpen={galleryOpen}
        onOpenChange={setGalleryOpen}
        className="sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>Galeria de fotos</DialogTitle>
          <DialogDescription>
            Escolha uma imagem já enviada para usar como capa.
          </DialogDescription>
        </DialogHeader>

        {library.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma foto cadastrada ainda. Envie fotos em Fotos ou use um novo
            upload.
          </p>
        ) : (
          <div className="grid max-h-[min(60vh,28rem)] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {library.map((item) => {
              const src = mediaPublicUrl(item.storagePath);
              const isSelected = selectedPath === item.storagePath;

              return (
                <button
                  key={item.storagePath}
                  type="button"
                  onClick={() => {
                    setSelectedPath(item.storagePath);
                    setMode("library");
                    setGalleryOpen(false);
                  }}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border bg-muted/40 text-left outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary",
                    isSelected
                      ? "border-primary ring-2 ring-primary"
                      : "border-border/80 hover:border-primary/50",
                  )}
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin gallery thumbnails from storage
                      <img
                        src={src}
                        alt={item.label}
                        className="size-full object-cover transition-transform group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                        Sem preview
                      </div>
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-2 p-2">
                    <p className="line-clamp-2 text-xs font-medium leading-snug">
                      {item.label}
                    </p>
                    {isSelected ? (
                      <CheckIcon
                        className="mt-0.5 size-3.5 shrink-0 text-primary"
                        weight="bold"
                      />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Dialog>
    </div>
  );
}
