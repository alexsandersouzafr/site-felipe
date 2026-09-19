"use server";

import { revalidatePath } from "next/cache";

import { parseSiteTheme } from "@/lib/site-theme";
import { createClient } from "@/lib/supabase/server";

export type AppearanceActionState = {
  error?: string;
  success?: string;
};

export async function updateAppearance(
  _prev: AppearanceActionState,
  formData: FormData,
): Promise<AppearanceActionState> {
  const theme = parseSiteTheme(formData.get("defaultTheme"));

  if (!theme) {
    return { error: "Escolha um tema." };
  }

  const supabase = await createClient();
  const { data: settings, error: readError } = await supabase
    .from("site_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (readError || !settings) {
    return { error: "Não foi possível carregar as configurações do site." };
  }

  // RLS turns a non-admin update into zero rows, not an error: check it.
  const { data: updated, error } = await supabase
    .from("site_settings")
    .update({ default_theme: theme })
    .eq("id", settings.id)
    .select("id");

  if (error || !updated?.length) {
    return { error: "Não foi possível salvar o tema." };
  }

  // Every page is rendered with the default theme (root layout).
  revalidatePath("/", "layout");

  return { success: "Tema padrão salvo." };
}
