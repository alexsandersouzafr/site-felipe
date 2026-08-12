import Link from "next/link";

import { createBiography } from "@/app/admin/(protected)/noticias/actions";
import { BiographyForm } from "@/components/admin/biography-form";

export default function NewBiographyPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/bio" className="underline underline-offset-4">
            Biografia
          </Link>{" "}
          / Nova
        </p>
        <h1 className="font-heading text-3xl tracking-tight">Nova biografia</h1>
      </div>
      <BiographyForm action={createBiography} mode="create" />
    </div>
  );
}
