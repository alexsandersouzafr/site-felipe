import Link from "next/link";
import { notFound } from "next/navigation";

import {
  type MediaActionState,
  updatePhoto,
} from "@/app/admin/(protected)/fotos/actions";
import { PhotoForm } from "@/components/admin/photo-form";
import { toDateTimeLocalValue } from "@/lib/datetime-local";
import { createClient } from "@/lib/supabase/server";

export default async function EditPhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const action = updatePhoto.bind(null, data.id) as (
    prev: MediaActionState,
    formData: FormData,
  ) => Promise<MediaActionState>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/fotos" className="underline underline-offset-4">
            Fotos
          </Link>{" "}
          / Editar
        </p>
        <h1 className="font-heading text-3xl tracking-tight">{data.alt_pt}</h1>
      </div>
      <PhotoForm
        action={action}
        mode="edit"
        initialValues={{
          status: data.status,
          publishAt: toDateTimeLocalValue(data.publish_at),
          storagePath: data.storage_path,
          altPt: data.alt_pt,
          altEn: data.alt_en,
          altEs: data.alt_es,
          credit: data.credit,
          collection: data.collection,
          displayOrder: data.display_order,
        }}
      />
    </div>
  );
}
