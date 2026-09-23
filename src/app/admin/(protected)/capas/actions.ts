"use server";

import { revalidatePath } from "next/cache";

import { routing } from "@/i18n/routing";
import { optionalText } from "@/lib/admin-form";
import { normalizeImageFocus } from "@/lib/image-focus";
import { deleteUnusedMedia } from "@/lib/media-cleanup";
import { MAX_IMAGE_BYTES, validateImageFile } from "@/lib/media-limits";
import {
  type AdminPageCoverKey,
  isAdminPageCoverKey,
  PAGE_COVER_LABELS,
} from "@/lib/page-covers";
import { createClient } from "@/lib/supabase/server";

export type PageCoverActionState = {
  error?: string;
  success?: string;
};

function revalidateCover(pageKey: AdminPageCoverKey) {
  revalidatePath("/admin/capas");
  revalidatePath(`/admin/capas/${pageKey}`);
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/${pageKey === "fotos" ? "fotos" : pageKey}`);
  }
}

async function uploadCover(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
) {
  const validation = validateImageFile(file, MAX_IMAGE_BYTES);
  if (!validation.ok) {
    return { ok: false as const, error: validation.error };
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `covers/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    return { ok: false as const, error: "Não foi possível enviar a imagem." };
  }

  return { ok: true as const, path };
}

export async function savePageCover(
  pageKey: AdminPageCoverKey,
  _prev: PageCoverActionState,
  formData: FormData,
): Promise<PageCoverActionState> {
  if (!isAdminPageCoverKey(pageKey)) {
    return { error: "Página inválida." };
  }

  const supabase = await createClient();
  const updatedAt = new Date().toISOString();

  // Kept to clean up after the write: replacing or removing a cover leaves
  // the old file behind otherwise.
  const { data: current } = await supabase
    .from("page_covers")
    .select("storage_path")
    .eq("page_key", pageKey)
    .maybeSingle();
  const previousPath = current?.storage_path ?? null;

  const clear = booleanish(formData.get("clear"));
  const file = formData.get("file");
  const existing = optionalText(formData, "existing");
  const objectPosition = normalizeImageFocus(
    String(formData.get("focus") ?? ""),
  );

  let storagePath = existing;

  if (clear) {
    storagePath = null;
  } else if (file instanceof File && file.size > 0) {
    const uploaded = await uploadCover(supabase, file);
    if (!uploaded.ok) {
      return { error: uploaded.error };
    }
    storagePath = uploaded.path;
  }

  const { error } = await supabase.from("page_covers").upsert({
    page_key: pageKey,
    storage_path: storagePath,
    object_position: objectPosition,
    updated_at: updatedAt,
  });

  if (error) {
    return {
      error: `Não foi possível salvar a capa de ${PAGE_COVER_LABELS[pageKey]}: ${error.message}`,
    };
  }

  if (previousPath && previousPath !== storagePath) {
    await deleteUnusedMedia(supabase, previousPath);
  }

  revalidateCover(pageKey);
  return {
    success: storagePath
      ? `Capa de ${PAGE_COVER_LABELS[pageKey]} atualizada.`
      : `Capa de ${PAGE_COVER_LABELS[pageKey]} removida.`,
  };
}

function booleanish(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").toLowerCase();
  return raw === "true" || raw === "on" || raw === "1";
}
