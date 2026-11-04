/**
 * Per-file limits for admin uploads. They have to stay under both request body
 * limits in `next.config.mjs` (`serverActions.bodySizeLimit` and
 * `proxyClientMaxBodySize`): past either one the request fails before the action
 * runs, and there is no server code left to turn that into a message.
 */
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_IMAGE_MB = MAX_IMAGE_BYTES / (1024 * 1024);

/**
 * Home photos and page covers fill the screen, and press photos are downloaded
 * for print, so these may be this large.
 */
export const MAX_HD_IMAGE_BYTES = 40 * 1024 * 1024;
export const MAX_HD_IMAGE_MB = MAX_HD_IMAGE_BYTES / (1024 * 1024);

/**
 * Everything one submit may carry. Kept under the 45 MB in `next.config.mjs`
 * because the files travel wrapped in multipart framing alongside every text
 * field, and only the files are counted here. Each limit above fits on its own;
 * several large images in one form have to be saved in turns.
 */
export const MAX_REQUEST_BYTES = 40 * 1024 * 1024;
export const MAX_REQUEST_MB = MAX_REQUEST_BYTES / (1024 * 1024);

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type ImageValidationResult = { ok: true } | { ok: false; error: string };

/** Rounded up, so a file just over the limit never reads as equal to it. */
function formatMegabytes(bytes: number) {
  return (Math.ceil((bytes / (1024 * 1024)) * 10) / 10).toLocaleString("pt-BR");
}

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
      error: `Esta imagem tem ${formatMegabytes(file.size)} MB e o limite é ${maxBytes / (1024 * 1024)} MB. Escolha uma imagem menor.`,
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
      error: `As imagens somam ${formatMegabytes(total)} MB e cada salvamento aceita até ${maxBytes / (1024 * 1024)} MB. Salve as que já escolheu e depois envie as outras.`,
    };
  }

  return { ok: true };
}

/**
 * The check a file picker runs the moment a file is chosen, so a refusal comes
 * then and not after filling in the rest of the form. `formData` is the form
 * as it stands, with the chosen file already in it.
 */
export function validatePickedImage(
  file: File,
  formData: FormData,
  maxBytes = MAX_IMAGE_BYTES,
): ImageValidationResult {
  const image = validateImageFile(file, maxBytes);

  return image.ok ? validateRequestSize(formData) : image;
}
