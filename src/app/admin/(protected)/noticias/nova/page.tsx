import Link from "next/link";

import { createNewsItem } from "@/app/admin/(protected)/noticias/actions";
import { NewsForm } from "@/components/admin/news-form";

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/noticias" className="underline underline-offset-4">
            Notícias
          </Link>{" "}
          / Nova
        </p>
        <h1 className="font-heading text-3xl tracking-tight">Nova notícia</h1>
      </div>
      <NewsForm action={createNewsItem} mode="create" />
    </div>
  );
}
