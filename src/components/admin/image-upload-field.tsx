"use client";

import { useEffect, useState } from "react";

import { useAdminToast } from "@/components/admin/toast";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MAX_BLOG_IMAGE_BYTES, validateImageFile } from "@/lib/media-limits";
import { mediaPublicUrl } from "@/lib/media-url";

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

export function ImageUploadField({
  id,
  name,
  label,
  existingPath = null,
  existingPathFieldName,
  required = false,
  description,
  maxBytes = MAX_BLOG_IMAGE_BYTES,
  onFileChange,
}: {
  id: string;
  name: string;
  label: string;
  existingPath?: string | null;
  existingPathFieldName?: string;
  required?: boolean;
  description?: string;
  /** Keep this in step with the limit the server action checks. */
  maxBytes?: number;
  onFileChange?: (file: File | null) => void;
}) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useAdminToast();
  const remotePreview = mediaPublicUrl(existingPath);
  const previewSrc = localPreview ?? remotePreview;

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  return (
    <Field>
      <FieldLabel htmlFor={id} required={required && !existingPath}>
        {label}
      </FieldLabel>
      <Input
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        required={required && !existingPath}
        onChange={(event) => {
          const file = readFileFromChange(event);
          const validation = file
            ? validateImageFile(file, maxBytes)
            : ({ ok: true } as const);

          // Sending a file the action will refuse anyway is worse than a
          // refusal here: past the request body limit, Next answers with an
          // error page before the action ever runs.
          if (!validation.ok) {
            setError(validation.error);
            toast({ tone: "error", message: validation.error });
            event.target.value = "";
            onFileChange?.(null);
            setLocalPreview((previous) => {
              if (previous) {
                URL.revokeObjectURL(previous);
              }
              return null;
            });
            return;
          }

          setError(null);
          onFileChange?.(file);
          setLocalPreview((previous) => {
            if (previous) {
              URL.revokeObjectURL(previous);
            }
            return file ? URL.createObjectURL(file) : null;
          });
        }}
      />
      {existingPathFieldName ? (
        <input
          type="hidden"
          name={existingPathFieldName}
          value={existingPath ?? ""}
        />
      ) : null}
      <FieldDescription>
        {description ??
          `JPEG, PNG, WebP ou GIF até ${maxBytes / (1024 * 1024)} MB.`}
      </FieldDescription>
      {error ? <FieldError>{error}</FieldError> : null}
      {previewSrc ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-border/80 bg-muted/30">
          {/* biome-ignore lint/performance/noImgElement: the preview may be a blob: URL of a file that is not uploaded yet, which next/image cannot load */}
          <img
            src={previewSrc}
            alt="Pré-visualização"
            className="max-h-56 w-full object-cover"
          />
        </div>
      ) : null}
    </Field>
  );
}

export function ImagePreview({
  src,
  alt = "Pré-visualização",
}: {
  src: string | null;
  alt?: string;
}) {
  if (!src) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-muted/30">
      {/* biome-ignore lint/performance/noImgElement: the preview may be a blob: URL of a file that is not uploaded yet, which next/image cannot load */}
      <img src={src} alt={alt} className="max-h-56 w-full object-cover" />
    </div>
  );
}
