import Link from "next/link";

import { createPressPhoto } from "@/app/admin/(protected)/imprensa/actions";
import { PressPhotoForm } from "@/components/admin/press-photo-form";

export default function NewPressPhotoPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link
            href="/admin/imprensa"
            className="underline underline-offset-4"
          >
            Imprensa
          </Link>{" "}
          / Nova
        </p>
        <h1 className="font-heading text-3xl tracking-tight">
          Nova foto de imprensa
        </h1>
      </div>
      <PressPhotoForm action={createPressPhoto} mode="create" />
    </div>
  );
}
