"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  integerField,
  optionalText,
  readLocalizedPair,
  readPublishingFields,
  requireScheduledPublishAt,
} from "@/lib/admin-form";
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
    es: "altEs",
  });

  if (!alts.pt) {
    return { error: "O texto alternativo em português é obrigatório." };
  }

  const supabase = await createClient();
  const file = formData.get("file");
  let storagePath = optionalText(formData, "storagePath");

  if (file instanceof File && file.size > 0) {
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
    alt_es: alts.es,
    credit: optionalText(formData, "credit"),
    collection: optionalText(formData, "collection"),
    display_order: integerField(formData, "displayOrder"),
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("photos").update(payload).eq("id", id)
    : await supabase.from("photos").insert(payload);

  if (error) {
    return { error: "Não foi possível salvar a foto." };
  }

  revalidatePath("/admin/fotos");
  redirect("/admin/fotos");
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
  redirect("/admin/fotos");
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
    es: "titleEs",
  });
  const descriptions = readLocalizedPair(formData, {
    pt: "descriptionPt",
    en: "descriptionEn",
    es: "descriptionEs",
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
    title_es: titles.es,
    description_pt: descriptions.pt,
    description_en: descriptions.en,
    description_es: descriptions.es,
    display_order: integerField(formData, "displayOrder"),
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("videos").update(payload).eq("id", id)
    : await supabase.from("videos").insert(payload);

  if (error) {
    return { error: "Não foi possível salvar o vídeo." };
  }

  revalidatePath("/admin/videos");
  redirect("/admin/videos");
}

export async function deleteVideo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("videos").delete().eq("id", id);
  revalidatePath("/admin/videos");
  redirect("/admin/videos");
}
