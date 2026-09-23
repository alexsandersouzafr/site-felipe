/**
 * Per-file limits for admin uploads. They have to stay under the request body
 * limit in `next.config.mjs`: past it Next refuses the request before the
 * action runs, and there is no server code left to turn that into a message.
 */
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_IMAGE_MB = MAX_IMAGE_BYTES / (1024 * 1024);

/** Press kits are downloaded for print, so they carry the largest files. */
export const MAX_PRESS_IMAGE_BYTES = 30 * 1024 * 1024;
export const MAX_PRESS_IMAGE_MB = MAX_PRESS_IMAGE_BYTES / (1024 * 1024);

/**
 * Everything one submit may carry. Kept under `serverActions.bodySizeLimit`
 * (40 MB) because the files travel wrapped in multipart framing alongside
 * every text field, and only the files are counted here. Forms that send more
 * than one image check this total as well as each file.
 */
export const MAX_REQUEST_BYTES = 36 * 1024 * 1024;
export const MAX_REQUEST_MB = MAX_REQUEST_BYTES / (1024 * 1024);

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type ImageValidationResult = { ok: true } | { ok: false; error: string };

export function validateImageFile(
  file: File,
  maxBytes = MAX_IMAGE_BYTES,
): ImageValidationResult {
  if (file.size <= 0) {
    return { ok: false, error: "Selecione um arquivo de imagem." };
  }

  if (file.size > maxBytes) {
    return {
      ok: false,
      error: `A imagem deve ter no máximo ${maxBytes / (1024 * 1024)} MB.`,
    };
  }

  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    )
  ) {
    return {
      ok: false,
      error: "Use uma imagem JPEG, PNG, WebP ou GIF.",
    };
  }

  return { ok: true };
}

/**
 * Sums the files a form is about to send. Each one can be within its own
 * limit and the request still be too large for the server to accept.
 */
export function validateRequestSize(
  formData: FormData,
  maxBytes = MAX_REQUEST_BYTES,
): ImageValidationResult {
  let total = 0;

  for (const value of formData.values()) {
    if (value instanceof File) {
      total += value.size;
    }
  }

  if (total > maxBytes) {
    return {
      ok: false,
      error: `As imagens somam ${Math.round(total / (1024 * 1024))} MB e o envio aceita no máximo ${maxBytes / (1024 * 1024)} MB. Envie parte delas e salve de novo.`,
    };
  }

  return { ok: true };
}
