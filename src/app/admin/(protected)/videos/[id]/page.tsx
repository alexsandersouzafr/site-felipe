import Link from "next/link";
import { notFound } from "next/navigation";

import {
  type MediaActionState,
  updateVideo,
} from "@/app/admin/(protected)/fotos/actions";
import { VideoForm } from "@/components/admin/video-form";
import { toDateTimeLocalValue } from "@/lib/datetime-local";
import { createClient } from "@/lib/supabase/server";

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const action = updateVideo.bind(null, data.id) as (
    prev: MediaActionState,
    formData: FormData,
  ) => Promise<MediaActionState>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/videos" className="underline underline-offset-4">
            Vídeos
          </Link>{" "}
          / Editar
        </p>
        <h1 className="font-heading text-3xl tracking-tight">
          {data.title_pt}
        </h1>
      </div>
      <VideoForm
        action={action}
        mode="edit"
        initialValues={{
          status: data.status,
          publishAt: toDateTimeLocalValue(data.publish_at),
          youtubeUrl: data.youtube_url,
          titlePt: data.title_pt,
          titleEn: data.title_en,
          titleEs: data.title_es,
          descriptionPt: data.description_pt,
          descriptionEn: data.description_en,
          descriptionEs: data.description_es,
          displayOrder: data.display_order,
        }}
      />
    </div>
  );
}
