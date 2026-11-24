import { cleanRepertoireText } from "@/lib/repertoire";
import { createClient } from "@/lib/supabase/server";

/** Every composer name in use, once each, for the form's suggestions. */
export async function listRepertoireComposers() {
  const supabase = await createClient();
  const { data } = await supabase.from("repertoire_works").select("composer");
  const names = new Set(
    (data ?? []).map((row) => cleanRepertoireText(row.composer)),
  );

  return [...names]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "pt", { sensitivity: "base" }));
}
