import Link from "next/link";

import { createHighlight } from "@/app/admin/(protected)/noticias/actions";
import { HighlightForm } from "@/components/admin/highlight-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewHighlightPage() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("highlights")
    .select("id", { count: "exact", head: true })
    .eq("show_on_page", true);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link
            href="/admin/destaques"
            className="underline underline-offset-4"
          >
            Destaques
          </Link>{" "}
          / Novo
        </p>
        <h1 className="font-heading text-3xl tracking-tight">Novo destaque</h1>
      </div>
      <HighlightForm
        action={createHighlight}
        mode="create"
        onPageCount={count ?? 0}
      />
    </div>
  );
}
