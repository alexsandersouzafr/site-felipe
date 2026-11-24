import Link from "next/link";
import { notFound } from "next/navigation";

import {
  type RepertoireActionState,
  updateRepertoireWork,
} from "@/app/admin/(protected)/repertorio/actions";
import { RepertoireForm } from "@/components/admin/repertoire-form";
import { isRepertoireGenre } from "@/lib/repertoire";
import { listRepertoireComposers } from "@/lib/repertoire-composers";
import { createClient } from "@/lib/supabase/server";

export default async function EditRepertoireWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, composers] = await Promise.all([
    supabase
      .from("repertoire_works")
      .select("id, title, composer, genre")
      .eq("id", id)
      .maybeSingle(),
    listRepertoireComposers(),
  ]);

  if (!data) {
    notFound();
  }

  const action = updateRepertoireWork.bind(null, data.id) as (
    prev: RepertoireActionState,
    formData: FormData,
  ) => Promise<RepertoireActionState>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link
            href="/admin/repertorio"
            className="underline underline-offset-4"
          >
            Repertório
          </Link>{" "}
          / Editar
        </p>
        <h1 className="font-heading text-3xl tracking-tight">{data.title}</h1>
      </div>
      <RepertoireForm
        action={action}
        mode="edit"
        composers={composers}
        initialValues={{
          title: data.title,
          composer: data.composer,
          genre: isRepertoireGenre(data.genre) ? data.genre : undefined,
        }}
      />
    </div>
  );
}
