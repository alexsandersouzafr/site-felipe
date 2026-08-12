import Link from "next/link";

import { createVideo } from "@/app/admin/(protected)/fotos/actions";
import { VideoForm } from "@/components/admin/video-form";

export default function NewVideoPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/videos" className="underline underline-offset-4">
            Vídeos
          </Link>{" "}
          / Novo
        </p>
        <h1 className="font-heading text-3xl tracking-tight">Novo vídeo</h1>
      </div>
      <VideoForm action={createVideo} mode="create" />
    </div>
  );
}
