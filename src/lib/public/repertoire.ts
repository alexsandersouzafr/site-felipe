import { isRepertoireGenre, type RepertoireWork } from "@/lib/repertoire";
import { createClient } from "@/lib/supabase/server";

export async function listRepertoire(): Promise<RepertoireWork[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("repertoire_works")
    .select("id, title, composer, genre");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).filter((row): row is RepertoireWork =>
    isRepertoireGenre(row.genre),
  );
}
