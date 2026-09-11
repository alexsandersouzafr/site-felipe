import Link from "next/link";
import { notFound } from "next/navigation";

import {
  type PressPhotoActionState,
  updatePressPhoto,
} from "@/app/admin/(protected)/imprensa/actions";
import { PressPhotoForm } from "@/components/admin/press-photo-form";
import { toDateTimeLocalValue } from "@/lib/datetime-local";
import { createClient } from "@/lib/supabase/server";

export default async function EditPressPhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("press_photos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const action = updatePressPhoto.bind(null, data.id) as (
    prev: PressPhotoActionState,
    formData: FormData,
  ) => Promise<PressPhotoActionState>;

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
          / Editar
        </p>
        <h1 className="font-heading text-3xl tracking-tight">
          {data.alt_pt}
        </h1>
      </div>
      <PressPhotoForm
        action={action}
        mode="edit"
        initialValues={{
          status: data.status,
          publishAt: toDateTimeLocalValue(data.publish_at),
          storagePath: data.storage_path,
          altPt: data.alt_pt,
          altEn: data.alt_en,
          altFr: data.alt_fr,
          credit: data.credit,
        }}
      />
    </div>
  );
}
