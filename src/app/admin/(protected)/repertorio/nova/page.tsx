import Link from "next/link";

import { createRepertoireWork } from "@/app/admin/(protected)/repertorio/actions";
import { RepertoireForm } from "@/components/admin/repertoire-form";
import { cleanRepertoireText, isRepertoireGenre } from "@/lib/repertoire";
import { listRepertoireComposers } from "@/lib/repertoire-composers";

export default async function NewRepertoireWorkPage({
  searchParams,
}: {
  searchParams: Promise<{
    compositor?: string;
    genero?: string;
    nova?: string;
  }>;
}) {
  const { compositor, genero, nova } = await searchParams;
  const composers = await listRepertoireComposers();

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
          / Nova obra
        </p>
        <h1 className="font-heading text-3xl tracking-tight">Nova obra</h1>
      </div>
      <RepertoireForm
        // After "Salvar e adicionar outra" the form starts over, keeping only
        // the composer and the column.
        key={nova ?? "primeira"}
        action={createRepertoireWork}
        mode="create"
        composers={composers}
        initialValues={{
          composer: cleanRepertoireText(compositor) || undefined,
          genre: isRepertoireGenre(genero) ? genero : undefined,
        }}
      />
    </div>
  );
}
