import Link from "next/link";

import { createPressPhoto } from "@/app/admin/(protected)/imprensa/actions";
import { PressPhotoForm } from "@/components/admin/press-photo-form";
import {
  DEFAULT_PRESS_PHOTO_CATEGORY,
  parsePressPhotoCategory,
} from "@/lib/press-categories";

export default async function NewPressPhotoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const category =
    parsePressPhotoCategory((await searchParams).categoria) ??
    DEFAULT_PRESS_PHOTO_CATEGORY;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link
            href={`/admin/imprensa?categoria=${category}`}
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
      <PressPhotoForm
        action={createPressPhoto}
        mode="create"
        initialValues={{ category }}
      />
    </div>
  );
}
