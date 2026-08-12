import Link from "next/link";

import { createPhoto } from "@/app/admin/(protected)/fotos/actions";
import { PhotoForm } from "@/components/admin/photo-form";

export default function NewPhotoPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/fotos" className="underline underline-offset-4">
            Fotos
          </Link>{" "}
          / Nova
        </p>
        <h1 className="font-heading text-3xl tracking-tight">Nova foto</h1>
      </div>
      <PhotoForm action={createPhoto} mode="create" />
    </div>
  );
}
