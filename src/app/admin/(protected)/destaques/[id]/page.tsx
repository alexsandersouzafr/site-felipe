import Link from "next/link";
import { notFound } from "next/navigation";

import {
  type EditorialActionState,
  updateHighlight,
} from "@/app/admin/(protected)/editorial/actions";
import { HighlightForm } from "@/components/admin/highlight-form";
import { toDateTimeLocalValue } from "@/lib/datetime-local";
import { createClient } from "@/lib/supabase/server";

export default async function EditHighlightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { count }] = await Promise.all([
    supabase.from("highlights").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("highlights")
      .select("id", { count: "exact", head: true })
      .eq("show_on_page", true),
  ]);

  if (!data) {
    notFound();
  }

  const action = updateHighlight.bind(null, data.id) as (
    prev: EditorialActionState,
    formData: FormData,
  ) => Promise<EditorialActionState>;

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
          / Editar
        </p>
        <h1 className="font-heading text-3xl tracking-tight">
          {data.title_pt}
        </h1>
      </div>
      <HighlightForm
        action={action}
        mode="edit"
        onPageCount={count ?? 0}
        initialValues={{
          status: data.status,
          publishAt: toDateTimeLocalValue(data.publish_at),
          showOnPage: data.show_on_page,
          titlePt: data.title_pt,
          titleEn: data.title_en,
          titleEs: data.title_es,
          descriptionPt: data.description_pt,
          descriptionEn: data.description_en,
          descriptionEs: data.description_es,
          displayOrder: data.display_order,
        }}
      />
    </div>
  );
}
