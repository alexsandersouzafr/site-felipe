export function mediaPublicUrl(storagePath: string | null | undefined) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const path = storagePath?.trim();

  if (!base || !path) {
    return null;
  }

  return `${base}/storage/v1/object/public/media/${path.replace(/^\//, "")}`;
}

/**
 * Turns a description into a safe file name, keeping the extension of the
 * stored file: "Maestro regendo!" + "press/abc.JPG" -> "maestro-regendo.jpg".
 */
export function downloadFileName(
  storagePath: string,
  description: string | null | undefined,
) {
  const extension = storagePath.split(".").pop()?.toLowerCase() || "jpg";
  const base = (description ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");

  return `${base || "foto"}.${extension}`;
}

/**
 * Same file as `mediaPublicUrl`, but the browser saves it instead of showing
 * it (Supabase Storage answers `?download=` with `Content-Disposition:
 * attachment`).
 */
export function mediaDownloadUrl(
  storagePath: string | null | undefined,
  fileName: string,
) {
  const url = mediaPublicUrl(storagePath);

  return url ? `${url}?download=${encodeURIComponent(fileName)}` : null;
}
