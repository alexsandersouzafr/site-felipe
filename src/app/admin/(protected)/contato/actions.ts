"use server";

import { revalidatePath } from "next/cache";

import { optionalText, readLocalizedPair } from "@/lib/admin-form";
import { createClient } from "@/lib/supabase/server";

export type ContactActionState = {
  error?: string;
  success?: string;
};

export async function updateContactSettings(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const id = String(formData.get("id") ?? "");
  const intros = readLocalizedPair(formData, {
    pt: "introPt",
    en: "introEn",
    es: "introEs",
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

  const payload = {
    contact_email: optionalText(formData, "contactEmail"),
    contact_phone: optionalText(formData, "contactPhone"),
    intro_pt: intros.pt,
    intro_en: intros.en,
    intro_es: intros.es,
    social_links: socialLinks,
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("site_settings").update(payload).eq("id", id)
    : await supabase.from("site_settings").insert(payload);

  if (error) {
    return { error: "Não foi possível salvar as informações de contato." };
  }

  revalidatePath("/admin/contato");
  return { success: "Contato atualizado." };
}
