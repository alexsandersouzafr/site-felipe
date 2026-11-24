"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin-session";
import { withToast } from "@/lib/admin-toast";
import {
  cleanRepertoireText,
  isRepertoireGenre,
  MAX_REPERTOIRE_TEXT,
} from "@/lib/repertoire";
import { createClient } from "@/lib/supabase/server";

export type RepertoireActionState = {
  error?: string;
  success?: string;
};

function revalidateRepertoire() {
  revalidatePath("/admin/repertorio");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/repertorio`);
  }
}

export async function createRepertoireWork(
  _prev: RepertoireActionState,
  formData: FormData,
): Promise<RepertoireActionState> {
  await requireAdmin();

  return saveRepertoireWork(null, formData);
}

export async function updateRepertoireWork(
  id: string,
  _prev: RepertoireActionState,
  formData: FormData,
): Promise<RepertoireActionState> {
  await requireAdmin();

  return saveRepertoireWork(id, formData);
}

async function saveRepertoireWork(
  id: string | null,
  formData: FormData,
): Promise<RepertoireActionState> {
  const title = cleanRepertoireText(formData.get("title"));
  const composer = cleanRepertoireText(formData.get("composer"));
  const genre = formData.get("genre");

  if (!title || !composer) {
    return { error: "Informe o nome da obra e o compositor." };
  }

  if (
    title.length > MAX_REPERTOIRE_TEXT ||
    composer.length > MAX_REPERTOIRE_TEXT
  ) {
    return {
      error: `Use no máximo ${MAX_REPERTOIRE_TEXT} caracteres em cada campo.`,
    };
  }

  if (!isRepertoireGenre(genre)) {
    return { error: "Escolha se a obra é erudita ou popular." };
  }

  const payload = {
    title,
    composer,
    genre,
    updated_at: new Date().toISOString(),
  };
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("repertoire_works").update(payload).eq("id", id)
    : await supabase.from("repertoire_works").insert(payload);

  if (error) {
    return { error: "Não foi possível salvar a obra." };
  }

  revalidateRepertoire();

  // Works tend to come in runs by the same composer: the next form starts
  // with the composer and the column already filled in.
  if (!id && formData.get("next") === "another") {
    const next = new URLSearchParams({
      compositor: composer,
      genero: genre,
      // A fresh key, so the form clears the title it just saved.
      nova: String(Date.now()),
    });
    redirect(withToast(`/admin/repertorio/nova?${next}`, "created"));
  }

  redirect(withToast("/admin/repertorio", id ? "saved" : "created"));
}

export async function deleteRepertoireWork(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase
    .from("repertoire_works")
    .delete()
    .eq("id", id);

  if (error) {
    redirect(withToast("/admin/repertorio", "delete-error"));
  }

  revalidateRepertoire();
  redirect(withToast("/admin/repertorio", "deleted"));
}
