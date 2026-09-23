"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { routing } from "@/i18n/routing";
import {
  optionalText,
  readLocalizedPair,
  readPublishingFields,
  requireScheduledPublishAt,
} from "@/lib/admin-form";
import { withToast } from "@/lib/admin-toast";
import { deleteUnusedMedia } from "@/lib/media-cleanup";
import { MAX_PRESS_IMAGE_BYTES, validateImageFile } from "@/lib/media-limits";
import { parsePressPhotoCategory } from "@/lib/press-categories";
import {
  nextDisplayOrder,
  parseReorderDirection,
  swapDisplayOrder,
} from "@/lib/reorder";
import { createClient } from "@/lib/supabase/server";

export type PressPhotoActionState = {
  error?: string;
};

function revalidatePressPhotos() {
  revalidatePath("/admin/imprensa");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/imprensa`);
  }
}

export async function createPressPhoto(
  _prev: PressPhotoActionState,
  formData: FormData,
): Promise<PressPhotoActionState> {
  return savePressPhoto(null, formData);
}

export async function updatePressPhoto(
  id: string,
  _prev: PressPhotoActionState,
  formData: FormData,
): Promise<PressPhotoActionState> {
  return savePressPhoto(id, formData);
}

async function savePressPhoto(
  id: string | null,
  formData: FormData,
): Promise<PressPhotoActionState> {
  const { status, publishAt } = readPublishingFields(formData);
  const scheduleError = requireScheduledPublishAt(status, publishAt);

  if (scheduleError) {
    return { error: scheduleError };
  }

  const category = parsePressPhotoCategory(formData.get("category"));

  if (!category) {
    return { error: "Escolha se a foto é do maestro ou no palco." };
  }

  const credit = optionalText(formData, "credit");

  if (!credit) {
    return {
      error: "O crédito do fotógrafo é obrigatório nas fotos de imprensa.",
    };
  }

  const alts = readLocalizedPair(formData, {
    pt: "altPt",
    en: "altEn",
    fr: "altFr",
  });

  if (!alts.pt) {
    return { error: "O texto alternativo em português é obrigatório." };
  }

  const supabase = await createClient();
  const file = formData.get("file");
  let storagePath = optionalText(formData, "storagePath");

  if (file instanceof File && file.size > 0) {
    const validation = validateImageFile(file, MAX_PRESS_IMAGE_BYTES);
    if (!validation.ok) {
      return { error: validation.error };
    }

    const extension = file.name.split(".").pop() || "jpg";
    const path = `press/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return { error: "Não foi possível enviar a imagem." };
    }

    storagePath = path;
  }

  if (!storagePath) {
    return { error: "Envie uma imagem ou informe o caminho existente." };
  }

  const payload = {
    status,
    publish_at: publishAt,
    storage_path: storagePath,
    category,
    alt_pt: alts.pt,
    alt_en: alts.en,
    alt_fr: alts.fr,
    credit,
    updated_at: new Date().toISOString(),
  };

  let error: unknown;
  let previousPath: string | null = null;

  if (id) {
    // A photo moved to the other section goes to the end of that list.
    const { data: existing } = await supabase
      .from("press_photos")
      .select("category, storage_path")
      .eq("id", id)
      .maybeSingle();
    const changedCategory = existing?.category !== category;
    previousPath = existing?.storage_path ?? null;

    ({ error } = await supabase
      .from("press_photos")
      .update(
        changedCategory
          ? {
              ...payload,
              display_order: await nextDisplayOrder(supabase, "press_photos"),
            }
          : payload,
      )
      .eq("id", id));
  } else {
    ({ error } = await supabase.from("press_photos").insert({
      ...payload,
      display_order: await nextDisplayOrder(supabase, "press_photos"),
    }));
  }

  if (error) {
    return { error: "Não foi possível salvar a foto de imprensa." };
  }

  if (previousPath && previousPath !== payload.storage_path) {
    await deleteUnusedMedia(supabase, previousPath);
  }

  revalidatePressPhotos();
  redirect(withToast(`/admin/imprensa?categoria=${category}`, "saved"));
}

export async function deletePressPhoto(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { data } = await supabase
    .from("press_photos")
    .select("storage_path, category")
    .eq("id", id)
    .maybeSingle();

  await supabase.from("press_photos").delete().eq("id", id);

  if (data?.storage_path) {
    await deleteUnusedMedia(supabase, data.storage_path);
  }

  revalidatePressPhotos();
  redirect(
    withToast(
      data?.category
        ? `/admin/imprensa?categoria=${data.category}`
        : "/admin/imprensa",
      "deleted",
    ),
  );
}

export async function movePressPhoto(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const direction = parseReorderDirection(formData.get("direction"));

  if (!id || !direction) {
    return;
  }

  const supabase = await createClient();
  const { data: photo } = await supabase
    .from("press_photos")
    .select("category")
    .eq("id", id)
    .maybeSingle();

  if (!photo) {
    return;
  }

  // Each section is ordered on its own, so a photo only trades places with
  // its neighbour in the same section.
  const { data } = await supabase
    .from("press_photos")
    .select("id, display_order")
    .eq("category", photo.category)
    .order("display_order", { ascending: true });

  const moved = await swapDisplayOrder(
    supabase,
    "press_photos",
    data ?? [],
    id,
    direction,
  );

  if (!moved) {
    redirect(
      withToast(`/admin/imprensa?categoria=${photo.category}`, "order-error"),
    );
  }

  revalidatePressPhotos();
}
