import Link from "next/link";
import { notFound } from "next/navigation";

import {
  type EditorialActionState,
  updateNewsItem,
} from "@/app/admin/(protected)/noticias/actions";
import { NewsForm } from "@/components/admin/news-form";
import { toDateTimeLocalValue } from "@/lib/datetime-local";
import type { RichTextDocument } from "@/lib/rich-text";
import { createClient } from "@/lib/supabase/server";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("news_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const action = updateNewsItem.bind(null, data.id) as (
    prev: EditorialActionState,
    formData: FormData,
  ) => Promise<EditorialActionState>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/noticias" className="underline underline-offset-4">
            Notícias
          </Link>{" "}
          / Editar
        </p>
        <h1 className="font-heading text-3xl tracking-tight">
          {data.title_pt}
        </h1>
      </div>
      <NewsForm
        action={action}
        mode="edit"
        initialValues={{
          status: data.status,
          publishAt: toDateTimeLocalValue(data.publish_at),
          slug: data.slug,
          titlePt: data.title_pt,
          titleEn: data.title_en,
          titleEs: data.title_es,
          excerptPt: data.excerpt_pt,
          excerptEn: data.excerpt_en,
          excerptEs: data.excerpt_es,
          contentPt: data.content_pt as RichTextDocument,
          contentEn: data.content_en as RichTextDocument | null,
          contentEs: data.content_es as RichTextDocument | null,
          coverImagePath: data.cover_image_path,
        }}
      />
    </div>
  );
}
