import { createHash } from "node:crypto";
import { cache } from "react";

import { normalizeImageFocus } from "@/lib/image-focus";
import { mediaPublicUrl } from "@/lib/media-url";
import { createClient } from "@/lib/supabase/server";

/**
 * The photo every page shares on social networks: the home opening photo,
 * framed as the admin framed it. `version` changes with the photo or its
 * framing, so networks that cache by URL fetch the new one.
 */
export const getShareImage = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("home_photos")
    .select("storage_path, object_position, updated_at")
    .eq("slot", "hero")
    .maybeSingle();
  const src = mediaPublicUrl(data?.storage_path ?? null);

  if (!data || !src) {
    return null;
  }

  const objectPosition = normalizeImageFocus(data.object_position);

  return {
    src,
    objectPosition,
    version: createHash("sha256")
      .update(`${data.storage_path}|${objectPosition}|${data.updated_at}`)
      .digest("hex")
      .slice(0, 12),
  };
});
