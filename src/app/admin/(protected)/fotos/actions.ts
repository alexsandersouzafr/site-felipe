"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  optionalText,
  readLocalizedPair,
  readPublishingFields,
  requireScheduledPublishAt,
} from "@/lib/admin-form";
import { withToast } from "@/lib/admin-toast";
import { validateImageFile } from "@/lib/media-limits";
import {
  nextDisplayOrder,
  parseReorderDirection,
  swapDisplayOrder,
} from "@/lib/reorder";
import { createClient } from "@/lib/supabase/server";

export type MediaActionState = {
  error?: string;
};

export async function createPhoto(
  _prev: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  return savePhoto(null, formData);
}

export async function updatePhoto(
  id: string,
  _prev: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  return savePhoto(id, formData);
}

async function savePhoto(
  id: string | null,
  formData: FormData,
): Promise<MediaActionState> {
  const { status, publishAt } = readPublishingFields(formData);
  const scheduleError = requireScheduledPublishAt(status, publishAt);

  if (scheduleError) {
    return { error: scheduleError };
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
    const validation = validateImageFile(file);
    if (!validation.ok) {
      return { error: validation.error };
    }

    const extension = file.name.split(".").pop() || "jpg";
    const path = `photos/${crypto.randomUUID()}.${extension}`;
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
    alt_pt: alts.pt,
    alt_en: alts.en,
    alt_fr: alts.fr,
    credit: optionalText(formData, "credit"),
    collection: optionalText(formData, "collection"),
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("photos").update(payload).eq("id", id)
    : await supabase.from("photos").insert({
        ...payload,
        display_order: await nextDisplayOrder(supabase, "photos"),
      });

  if (error) {
    return { error: "Não foi possível salvar a foto." };
  }

  revalidatePath("/admin/fotos");
  redirect(withToast("/admin/fotos", "saved"));
}

export async function movePhoto(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const direction = parseReorderDirection(formData.get("direction"));

  if (!id || !direction) {
    return;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("photos")
    .select("id, display_order")
    .order("display_order", { ascending: true });

  const moved = await swapDisplayOrder(
    supabase,
    "photos",
    data ?? [],
    id,
    direction,
  );

  if (!moved) {
    redirect(withToast("/admin/fotos", "order-error"));
  }

  revalidatePath("/admin/fotos");
}

export async function deletePhoto(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { data } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  await supabase.from("photos").delete().eq("id", id);

  if (data?.storage_path) {
    await supabase.storage.from("media").remove([data.storage_path]);
  }

  revalidatePath("/admin/fotos");
  redirect(withToast("/admin/fotos", "deleted"));
}

export async function createVideo(
  _prev: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  return saveVideo(null, formData);
}

export async function updateVideo(
  id: string,
  _prev: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  return saveVideo(id, formData);
}

async function saveVideo(
  id: string | null,
  formData: FormData,
): Promise<MediaActionState> {
  const { status, publishAt } = readPublishingFields(formData);
  const scheduleError = requireScheduledPublishAt(status, publishAt);

  if (scheduleError) {
    return { error: scheduleError };
  }

  const titles = readLocalizedPair(formData, {
    pt: "titlePt",
    en: "titleEn",
    fr: "titleFr",
  });
  const descriptions = readLocalizedPair(formData, {
    pt: "descriptionPt",
    en: "descriptionEn",
    fr: "descriptionFr",
  });
  const youtubeUrl = String(formData.get("youtubeUrl") ?? "").trim();

  if (!titles.pt) {
    return { error: "O título em português é obrigatório." };
  }

  if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
    return { error: "Informe uma URL válida do YouTube." };
  }
  const payload = {
    status,
    publish_at: publishAt,
    youtube_url: youtubeUrl,
    title_pt: titles.pt,
    title_en: titles.en,
    title_fr: titles.fr,
    description_pt: descriptions.pt,
    description_en: descriptions.en,
    description_fr: descriptions.fr,
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("videos").update(payload).eq("id", id)
    : await supabase.from("videos").insert({
        ...payload,
        display_order: await nextDisplayOrder(supabase, "videos"),
      });

  if (error) {
    return { error: "Não foi possível salvar o vídeo." };
  }

  revalidatePath("/admin/videos");
  redirect(withToast("/admin/videos", "saved"));
}

export async function deleteVideo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("videos").delete().eq("id", id);
  revalidatePath("/admin/videos");
  redirect(withToast("/admin/videos", "deleted"));
}

export async function moveVideo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const direction = parseReorderDirection(formData.get("direction"));

  if (!id || !direction) {
    return;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("videos")
    .select("id, display_order")
    .order("display_order", { ascending: true });

  const moved = await swapDisplayOrder(
    supabase,
    "videos",
    data ?? [],
    id,
    direction,
  );

  if (!moved) {
    redirect(withToast("/admin/videos", "order-error"));
  }

  revalidatePath("/admin/videos");
}
