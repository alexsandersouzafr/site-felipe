import Link from "next/link";
import { notFound } from "next/navigation";

import {
  type BlogActionState,
  updateBlogPost,
} from "@/app/admin/(protected)/blog/actions";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { blogBlocksSchema } from "@/lib/blog-blocks";
import { toDateTimeLocalValue } from "@/lib/datetime-local";
import { createClient } from "@/lib/supabase/server";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: photos }] = await Promise.all([
    supabase.from("news_items").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("photos")
      .select("storage_path, alt_pt")
      .order("display_order", { ascending: true }),
  ]);

  if (!data) {
    notFound();
  }

  const action = updateBlogPost.bind(null, data.id) as (
    prev: BlogActionState,
    formData: FormData,
  ) => Promise<BlogActionState>;

  const blocks = blogBlocksSchema.safeParse(data.blocks);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/blog" className="underline underline-offset-4">
            Blog
          </Link>{" "}
          / Editar
        </p>
        <h1 className="font-heading text-3xl tracking-tight">
          {data.title_pt}
        </h1>
      </div>
      <BlogPostForm
        action={action}
        mode="edit"
        coverLibrary={(photos ?? []).map((photo) => ({
          storagePath: photo.storage_path,
          label: photo.alt_pt,
        }))}
        initialValues={{
          status: data.status,
          publishAt: toDateTimeLocalValue(data.publish_at),
          titlePt: data.title_pt,
          titleEn: data.title_en,
          titleEs: data.title_es,
          blocks: blocks.success ? blocks.data : [],
          coverImagePath: data.cover_image_path,
        }}
      />
    </div>
  );
}
