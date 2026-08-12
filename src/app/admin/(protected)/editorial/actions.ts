"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  booleanField,
  integerField,
  readLocalizedPair,
  readPublishingFields,
  requireScheduledPublishAt,
} from "@/lib/admin-form";
import {
  canEnableHighlightOnPage,
  MAX_BIO_PAGE_HIGHLIGHTS,
} from "@/lib/bio-page";
import { isRichTextEmpty, parseRichTextInput } from "@/lib/rich-text";
import { createClient } from "@/lib/supabase/server";

export type EditorialActionState = {
  error?: string;
};

export async function createBiography(
  _prev: EditorialActionState,
  formData: FormData,
): Promise<EditorialActionState> {
  return saveBiography(null, formData);
}

export async function updateBiography(
  id: string,
  _prev: EditorialActionState,
  formData: FormData,
): Promise<EditorialActionState> {
  return saveBiography(id, formData);
}

async function saveBiography(
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

  if (!titles.pt) {
    return { error: "O título em português é obrigatório." };
  }

  const contentPt = parseRichTextInput(formData.get("contentPt"));
  if (isRichTextEmpty(contentPt)) {
    return { error: "O texto da biografia em português é obrigatório." };
  }

  const contentEn = parseRichTextInput(formData.get("contentEn"));
  const contentEs = parseRichTextInput(formData.get("contentEs"));
  const showOnPage = booleanField(formData, "showOnPage");

  const payload = {
    status,
    publish_at: publishAt,
    title_pt: titles.pt,
    title_en: titles.en,
    title_es: titles.es,
    content_pt: contentPt,
    content_en: isRichTextEmpty(contentEn) ? null : contentEn,
    content_es: isRichTextEmpty(contentEs) ? null : contentEs,
    show_on_page: showOnPage,
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();

  if (showOnPage) {
    const clearQuery = supabase
      .from("biographies")
      .update({ show_on_page: false, updated_at: new Date().toISOString() })
      .eq("show_on_page", true);

    const { error: clearError } = id
      ? await clearQuery.neq("id", id)
      : await clearQuery;

    if (clearError) {
      return { error: "Não foi possível atualizar a biografia da página." };
    }
  }

  const { error } = id
    ? await supabase.from("biographies").update(payload).eq("id", id)
    : await supabase.from("biographies").insert(payload);

  if (error) {
    return { error: "Não foi possível salvar a biografia." };
  }

  revalidatePath("/admin/bio");
  redirect("/admin/bio");
}

export async function setBiographyOnPage(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  const supabase = await createClient();
  const updatedAt = new Date().toISOString();

  const { error: clearError } = await supabase
    .from("biographies")
    .update({ show_on_page: false, updated_at: updatedAt })
    .eq("show_on_page", true)
    .neq("id", id);

  if (clearError) {
    throw new Error("Não foi possível atualizar a biografia da página.");
  }

  const { error } = await supabase
    .from("biographies")
    .update({ show_on_page: true, updated_at: updatedAt })
    .eq("id", id);

  if (error) {
    throw new Error("Não foi possível definir a biografia da página.");
  }

  revalidatePath("/admin/bio");
  redirect("/admin/bio");
}

export async function deleteBiography(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("biographies").delete().eq("id", id);
  revalidatePath("/admin/bio");
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
