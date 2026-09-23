"use server";

import { revalidatePath } from "next/cache";

import { routing } from "@/i18n/routing";
import { optionalText, readLocalizedPair } from "@/lib/admin-form";
import { deleteUnusedMedia } from "@/lib/media-cleanup";
import { validateImageFile } from "@/lib/media-limits";
import { createClient } from "@/lib/supabase/server";

export type ContactActionState = {
  error?: string;
  success?: string;
};

async function uploadBlogFallbackCover(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
) {
  const validation = validateImageFile(file);
  if (!validation.ok) {
    return { ok: false as const, error: validation.error };
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `settings/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    return { ok: false as const, error: "Não foi possível enviar a imagem." };
  }

  return { ok: true as const, path };
}

export async function updateContactSettings(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const id = String(formData.get("id") ?? "");
  const intros = readLocalizedPair(formData, {
    pt: "introPt",
    en: "introEn",
    fr: "introFr",
  });

  if (!intros.pt) {
    return { error: "O texto de introdução em português é obrigatório." };
  }

  const socialRaw = String(formData.get("socialLinks") ?? "").trim();
  let socialLinks: Array<{ label: string; url: string }> = [];

  if (socialRaw) {
    socialLinks = socialRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, url] = line.split("|").map((part) => part.trim());
        return { label: label || url, url };
      })
      .filter((item) => Boolean(item.url));
  }

  const supabase = await createClient();

  const { data: currentSettings } = await supabase
    .from("site_settings")
    .select("blog_fallback_cover_path")
    .maybeSingle();
  const previousCoverPath = currentSettings?.blog_fallback_cover_path ?? null;

  let blogFallbackCoverPath = optionalText(formData, "blogFallbackCoverPath");
  const blogFallbackCoverFile = formData.get("blogFallbackCoverFile");
  if (blogFallbackCoverFile instanceof File && blogFallbackCoverFile.size > 0) {
    const uploaded = await uploadBlogFallbackCover(
      supabase,
      blogFallbackCoverFile,
    );
    if (!uploaded.ok) {
      return { error: uploaded.error };
    }
    blogFallbackCoverPath = uploaded.path;
  }

  const payload = {
    contact_email: optionalText(formData, "contactEmail"),
    contact_phone: optionalText(formData, "contactPhone"),
    intro_pt: intros.pt,
    intro_en: intros.en,
    intro_fr: intros.fr,
    social_links: socialLinks,
    blog_fallback_cover_path: blogFallbackCoverPath,
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("site_settings").update(payload).eq("id", id)
    : await supabase.from("site_settings").insert(payload);

  if (error) {
    return { error: "Não foi possível salvar as informações de contato." };
  }

  if (previousCoverPath && previousCoverPath !== blogFallbackCoverPath) {
    await deleteUnusedMedia(supabase, previousCoverPath);
  }

  revalidatePath("/admin/contato");
  revalidatePath("/admin/blog");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/blog`);
  }
  return { success: "Contato atualizado." };
}
