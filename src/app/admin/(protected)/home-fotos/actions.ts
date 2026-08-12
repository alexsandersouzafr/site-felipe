"use server";

import { revalidatePath } from "next/cache";

import { routing } from "@/i18n/routing";
import { optionalText, readLocalizedPair } from "@/lib/admin-form";
import {
  HOME_PHOTO_SLOTS,
  type HomePhotoSlot,
  isHomePhotoSlot,
} from "@/lib/home-photo-slots";
import { normalizeImageFocus } from "@/lib/image-focus";
import { MAX_HD_IMAGE_BYTES, validateImageFile } from "@/lib/media-limits";
import { createClient } from "@/lib/supabase/server";

export type HomeMediaActionState = {
  error?: string;
  success?: string;
};

function revalidateHomeMedia() {
  revalidatePath("/admin/home-fotos");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
  }
}

async function uploadHdImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  folder: "home/parallax" | "covers",
) {
  const validation = validateImageFile(file, MAX_HD_IMAGE_BYTES);
  if (!validation.ok) {
    return { ok: false as const, error: validation.error };
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    return { ok: false as const, error: "Não foi possível enviar a imagem." };
  }

  return { ok: true as const, path };
}

export async function saveHomePhotoSlots(
  _prev: HomeMediaActionState,
  formData: FormData,
): Promise<HomeMediaActionState> {
  const supabase = await createClient();
  const updatedAt = new Date().toISOString();

  for (const slot of HOME_PHOTO_SLOTS) {
    const slotKey = slot.key;
    const clear = booleanish(formData.get(`clear_${slotKey}`));
    const file = formData.get(`file_${slotKey}`);
    const existing = optionalText(formData, `existing_${slotKey}`);
    const alts = readLocalizedPair(formData, {
      pt: `altPt_${slotKey}`,
      en: `altEn_${slotKey}`,
      es: `altEs_${slotKey}`,
    });
    const objectPosition = normalizeImageFocus(
      String(formData.get(`focus_${slotKey}`) ?? ""),
    );

    if (clear) {
      const { error } = await supabase
        .from("home_photos")
        .delete()
        .eq("slot", slotKey);
      if (error) {
        return { error: `Não foi possível remover ${slot.label}.` };
      }

      if (slotKey === "hero") {
        await supabase.from("page_covers").upsert({
          page_key: "home",
          storage_path: null,
          object_position: objectPosition,
          updated_at: updatedAt,
        });
      }
      continue;
    }

    let storagePath = existing;
    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadHdImage(supabase, file, "home/parallax");
      if (!uploaded.ok) {
        return { error: `${slot.label}: ${uploaded.error}` };
      }
      storagePath = uploaded.path;
    }

    const hasNewFile = file instanceof File && file.size > 0;
    if (!storagePath) {
      if (hasNewFile) {
        return {
          error: `${slot.label}: não foi possível usar o arquivo enviado.`,
        };
      }
      continue;
    }

    if (!alts.pt) {
      return {
        error: `${slot.label}: o texto alternativo em português é obrigatório para publicar a faixa.`,
      };
    }

    if (!isHomePhotoSlot(slotKey)) {
      continue;
    }

    const displayOrder =
      slotKey === "hero" ? 0 : Number(slotKey.replace("band_", "")) || 1;

    const { error } = await supabase.from("home_photos").upsert(
      {
        slot: slotKey,
        storage_path: storagePath,
        alt_pt: alts.pt,
        alt_en: alts.en,
        alt_es: alts.es,
        object_position: objectPosition,
        display_order: displayOrder,
        updated_at: updatedAt,
      },
      { onConflict: "slot" },
    );

    if (error) {
      return {
        error: `Não foi possível salvar ${slot.label}: ${error.message}`,
      };
    }

    // Mantém page_covers.home alinhada à capa/hero da home.
    if (slotKey === "hero") {
      const { error: coverError } = await supabase.from("page_covers").upsert({
        page_key: "home",
        storage_path: storagePath,
        object_position: objectPosition,
        updated_at: updatedAt,
      });
      if (coverError) {
        return {
          error: `Hero salvo, mas a capa da home não sincronizou: ${coverError.message}`,
        };
      }
    }
  }

  revalidateHomeMedia();
  return { success: "Fotos da home atualizadas." };
}

function booleanish(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").toLowerCase();
  return raw === "true" || raw === "on" || raw === "1";
}

export type { HomePhotoSlot };
