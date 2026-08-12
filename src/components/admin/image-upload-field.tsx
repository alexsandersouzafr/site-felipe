"use client";

import { useEffect, useState } from "react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MAX_BLOG_IMAGE_MB } from "@/lib/media-limits";
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
}: {
  id: string;
  name: string;
  label: string;
  existingPath?: string | null;
  existingPathFieldName?: string;
  required?: boolean;
  description?: string;
}) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
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
        {description ?? `JPEG, PNG, WebP ou GIF até ${MAX_BLOG_IMAGE_MB} MB.`}
      </FieldDescription>
      {previewSrc ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-border/80 bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="max-h-56 w-full object-cover" />
    </div>
  );
}
