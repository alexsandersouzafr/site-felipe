import Link from "next/link";
import { notFound } from "next/navigation";

import {
  type EditorialActionState,
  updateBiography,
} from "@/app/admin/(protected)/noticias/actions";
import { BiographyForm } from "@/components/admin/biography-form";
import { toDateTimeLocalValue } from "@/lib/datetime-local";
import type { RichTextDocument } from "@/lib/rich-text";
import { createClient } from "@/lib/supabase/server";

export default async function EditBiographyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("biographies")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const action = updateBiography.bind(null, data.id) as (
    prev: EditorialActionState,
    formData: FormData,
  ) => Promise<EditorialActionState>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/bio" className="underline underline-offset-4">
            Biografia
          </Link>{" "}
          / Editar
        </p>
        <h1 className="font-heading text-3xl tracking-tight">
          {data.title_pt}
        </h1>
      </div>
      <BiographyForm
        action={action}
        mode="edit"
        initialValues={{
          status: data.status,
          publishAt: toDateTimeLocalValue(data.publish_at),
          showOnPage: data.show_on_page,
          titlePt: data.title_pt,
          titleEn: data.title_en,
          titleEs: data.title_es,
          contentPt: data.content_pt as RichTextDocument,
          contentEn: data.content_en as RichTextDocument | null,
          contentEs: data.content_es as RichTextDocument | null,
        }}
      />
    </div>
  );
}
