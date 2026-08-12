/** Soft limits for admin uploads. Supabase project limits may be higher. */
export const MAX_BLOG_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_BLOG_IMAGE_MB = MAX_BLOG_IMAGE_BYTES / (1024 * 1024);

/** High-definition uploads for home parallax bands and page covers. */
export const MAX_HD_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_HD_IMAGE_MB = MAX_HD_IMAGE_BYTES / (1024 * 1024);

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type ImageValidationResult = { ok: true } | { ok: false; error: string };

export function validateImageFile(
  file: File,
  maxBytes = MAX_BLOG_IMAGE_BYTES,
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
