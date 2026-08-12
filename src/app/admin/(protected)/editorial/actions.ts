"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import {
  booleanField,
  integerField,
  optionalText,
  readLocalizedPair,
  readPublishingFields,
  requireScheduledPublishAt,
} from "@/lib/admin-form";
import {
  canEnableHighlightOnPage,
  MAX_BIO_PAGE_HIGHLIGHTS,
} from "@/lib/bio-page";
import { validateImageFile } from "@/lib/media-limits";
import { isRichTextEmpty, parseRichTextInput } from "@/lib/rich-text";
import { createClient } from "@/lib/supabase/server";

export type EditorialActionState = {
  error?: string;
};

function revalidateBiographyPaths() {
  revalidatePath("/admin/bio");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/bio`);
  }
}

async function uploadBiographyImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
) {
  const validation = validateImageFile(file);
  if (!validation.ok) {
    return { ok: false as const, error: validation.error };
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `bio/cover/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    return { ok: false as const, error: "Não foi possível enviar a imagem." };
  }

  return { ok: true as const, path };
}

export async function saveBiography(
  _prev: EditorialActionState,
  formData: FormData,
): Promise<EditorialActionState> {
  const summaries = readLocalizedPair(formData, {
    pt: "summaryPt",
    en: "summaryEn",
    es: "summaryEs",
  });

  if (!summaries.pt) {
    return { error: "O resumo em português é obrigatório." };
  }

  const contentPt = parseRichTextInput(formData.get("contentPt"));
  if (isRichTextEmpty(contentPt)) {
    return { error: "O texto da biografia em português é obrigatório." };
  }

  const contentEn = parseRichTextInput(formData.get("contentEn"));
  const contentEs = parseRichTextInput(formData.get("contentEs"));

  const supabase = await createClient();

  let imagePath = optionalText(formData, "imagePath");
  const imageFile = formData.get("imageFile");
  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await uploadBiographyImage(supabase, imageFile);
    if (!uploaded.ok) {
      return { error: uploaded.error };
    }
    imagePath = uploaded.path;
  }

  const { data: existing, error: existingError } = await supabase
    .from("biographies")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    return { error: "Não foi possível carregar a biografia." };
  }

  const payload = {
    status: "published" as const,
    publish_at: null,
    title_pt: "Biografia",
    title_en: null,
    title_es: null,
    content_pt: contentPt,
    content_en: isRichTextEmpty(contentEn) ? null : contentEn,
    content_es: isRichTextEmpty(contentEs) ? null : contentEs,
    summary_pt: summaries.pt,
    summary_en: summaries.en,
    summary_es: summaries.es,
    image_path: imagePath,
    show_on_page: true,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error: clearError } = await supabase
      .from("biographies")
      .update({ show_on_page: false, updated_at: payload.updated_at })
      .eq("show_on_page", true)
      .neq("id", existing.id);

    if (clearError) {
      return { error: "Não foi possível atualizar a biografia." };
    }

    const { error } = await supabase
      .from("biographies")
      .update(payload)
      .eq("id", existing.id);

    if (error) {
      return { error: "Não foi possível salvar a biografia." };
    }
  } else {
    const { error } = await supabase.from("biographies").insert(payload);

    if (error) {
      return { error: "Não foi possível salvar a biografia." };
    }
  }

  revalidateBiographyPaths();
  redirect("/admin/bio");
}

export async function createHighlight(
  _prev: EditorialActionState,
  formData: FormData,
): Promise<EditorialActionState> {
  return saveHighlight(null, formData);
}

export async function updateHighlight(
  id: string,
  _prev: EditorialActionState,
  formData: FormData,
): Promise<EditorialActionState> {
  return saveHighlight(id, formData);
}

async function saveHighlight(
  id: string | null,
  formData: FormData,
): Promise<EditorialActionState> {
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

  if (!titles.pt || !descriptions.pt) {
    return { error: "Título e descrição em português são obrigatórios." };
  }

  const showOnPage = booleanField(formData, "showOnPage");
  const supabase = await createClient();

  if (showOnPage) {
    let currentlyOnPage = false;

    if (id) {
      const { data: current } = await supabase
        .from("highlights")
        .select("show_on_page")
        .eq("id", id)
        .maybeSingle();
      currentlyOnPage = Boolean(current?.show_on_page);
    }

    const { count, error: countError } = await supabase
      .from("highlights")
      .select("id", { count: "exact", head: true })
      .eq("show_on_page", true);

    if (countError) {
      return { error: "Não foi possível validar os destaques da página." };
    }

    if (!canEnableHighlightOnPage(currentlyOnPage, count ?? 0)) {
      return {
        error: `A página de biografia já tem ${MAX_BIO_PAGE_HIGHLIGHTS} destaques. Remova um antes de adicionar outro.`,
      };
    }
  }

  const payload = {
    status,
    publish_at: publishAt,
    title_pt: titles.pt,
    title_en: titles.en,
    title_es: titles.es,
    description_pt: descriptions.pt,
    description_en: descriptions.en,
    description_es: descriptions.es,
    display_order: integerField(formData, "displayOrder"),
    show_on_page: showOnPage,
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("highlights").update(payload).eq("id", id)
    : await supabase.from("highlights").insert(payload);

  if (error) {
    return { error: "Não foi possível salvar o destaque." };
  }

  revalidatePath("/admin/destaques");
  redirect("/admin/destaques");
}

export async function deleteHighlight(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("highlights").delete().eq("id", id);
  revalidatePath("/admin/destaques");
  redirect("/admin/destaques");
}
