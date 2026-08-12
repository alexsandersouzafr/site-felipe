export function mediaPublicUrl(storagePath: string | null | undefined) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const path = storagePath?.trim();

  if (!base || !path) {
    return null;
  }

  return `${base}/storage/v1/object/public/media/${path.replace(/^\//, "")}`;
}
