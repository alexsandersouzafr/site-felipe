import Link from "next/link";

import { createBlogPost } from "@/app/admin/(protected)/blog/actions";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewBlogPostPage() {
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("photos")
    .select("storage_path, alt_pt")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/blog" className="underline underline-offset-4">
            Blog
          </Link>{" "}
          / Novo
        </p>
        <h1 className="font-heading text-3xl tracking-tight">Novo post</h1>
      </div>
      <BlogPostForm
        action={createBlogPost}
        mode="create"
        coverLibrary={(photos ?? []).map((photo) => ({
          storagePath: photo.storage_path,
          label: photo.alt_pt,
        }))}
      />
    </div>
  );
}
