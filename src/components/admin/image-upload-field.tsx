"use client";

import { useEffect, useRef, useState } from "react";

import { FilePickerButton } from "@/components/admin/file-picker-button";
import {
  preparePickedImage,
  reducedMessage,
} from "@/components/admin/prepare-picked-image";
import { SitePreview } from "@/components/admin/site-preview";
import { useAdminToast } from "@/components/admin/toast";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  type ReductionProfile,
  SITE_PHOTO_REDUCTION,
} from "@/lib/image-reduction";
import { MAX_IMAGE_BYTES } from "@/lib/media-limits";
import { mediaPublicUrl } from "@/lib/media-url";
import type { SiteFrame } from "@/lib/site-frames";

export function ImageUploadField({
  id,
  name,
  label,
  existingPath = null,
  existingPathFieldName,
  required = false,
  description,
  maxBytes = MAX_IMAGE_BYTES,
  reduction = SITE_PHOTO_REDUCTION,
  frames,
  onFileChange,
  onPreviewChange,
  onRemove,
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
  /** How the photo is shrunk before upload; null sends it as chosen. */
  reduction?: ReductionProfile | null;
  /** The site's frames for this photo, shown under the field. */
  frames?: readonly SiteFrame[];
  onFileChange?: (file: File | null) => void;
  /** For a form that shows the photo itself, framing included. */
  onPreviewChange?: (src: string | null) => void;
  /** Omit to hide the remove button. */
  onRemove?: () => void;
}) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reducing, setReducing] = useState(false);
  const latestPick = useRef(0);
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

  // After a save the server sends the stored image back — or nothing, when it
  // was removed. Either way the local pick is stale and has to go, or the form
  // would still show an image that is no longer there.
  // biome-ignore lint/correctness/useExhaustiveDependencies: resets on the saved path, not on the preview it clears
  useEffect(() => {
    setLocalPreview((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return null;
    });
    setFileName(null);
    setError(null);
  }, [existingPath]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reports the photo, not the callback identity
  useEffect(() => {
    onPreviewChange?.(previewSrc);
  }, [previewSrc]);

  function showFile(file: File | null) {
    setFileName(file?.name ?? null);
    onFileChange?.(file);
    setLocalPreview((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function handlePick(input: HTMLInputElement) {
    const pick = ++latestPick.current;
    const prepared = await preparePickedImage(input, {
      maxBytes,
      reduction,
      onReducing: (active) => {
        if (pick === latestPick.current) {
          setReducing(active);
        }
      },
    });

    // A second file was chosen while this one was being reduced.
    if (pick !== latestPick.current) {
      return;
    }

    // Sending a file the action will refuse anyway is worse than a refusal
    // here: past the request body limit, Next answers with an error page before
    // the action ever runs.
    if (!prepared.ok) {
      setError(prepared.error);
      toast({ tone: "error", message: prepared.error });
      showFile(null);
      return;
    }

    setError(null);
    showFile(prepared.file);

    if (prepared.file && prepared.reducedFrom) {
      toast({
        tone: "success",
        message: reducedMessage(prepared.reducedFrom, prepared.file.size),
      });
    }
  }

  return (
    <Field>
      <FieldLabel htmlFor={id} required={required && !existingPath}>
        {label}
      </FieldLabel>
      <FilePickerButton
        id={id}
        name={name}
        // Deliberately not `required`: the input is off screen, so the browser
        // would refuse to submit while trying to point at something nobody can
        // see. The label keeps the asterisk and the action returns the reason.
        fileName={reducing ? "Reduzindo a imagem…" : fileName}
        hasImage={Boolean(existingPath)}
        onRemove={onRemove}
        onChange={(event) => {
          void handlePick(event.target);
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
      {onPreviewChange ? null : frames ? (
        <div className="mt-3">
          <SitePreview src={previewSrc} focus="50% 50%" frames={frames} />
        </div>
      ) : (
        <ImagePreview src={previewSrc} />
      )}
    </Field>
  );
}

/** The whole photo, uncropped, for a field the site shows in no fixed shape. */
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
    <div className="mt-3 overflow-hidden rounded-2xl border border-border/80 bg-muted/30">
      {/* biome-ignore lint/performance/noImgElement: the preview may be a blob: URL of a file that is not uploaded yet, which next/image cannot load */}
      <img src={src} alt={alt} className="max-h-56 w-full object-contain" />
    </div>
  );
}
