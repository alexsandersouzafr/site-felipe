import { saveBiography } from "@/app/admin/(protected)/editorial/actions";
import { AdminPageHeader } from "@/components/admin/admin-list";
import { BiographyForm } from "@/components/admin/biography-form";
import { coerceRichTextDocument } from "@/lib/rich-text";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBioPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("biographies")
    .select(
      "id, image_path, summary_pt, summary_en, summary_es, content_pt, content_en, content_es",
    )
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Biografia"
        description="Edite o texto da biografia, a imagem do topo e o resumo exibido na home. Salvar substitui o conteúdo anterior."
      />
      {error ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar a biografia.
        </p>
      ) : (
        <BiographyForm
          action={saveBiography}
          initialValues={
            data
              ? {
                  imagePath: data.image_path,
                  summaryPt: data.summary_pt,
                  summaryEn: data.summary_en,
                  summaryEs: data.summary_es,
                  contentPt: coerceRichTextDocument(data.content_pt),
                  contentEn: data.content_en
                    ? coerceRichTextDocument(data.content_en)
                    : null,
                  contentEs: data.content_es
                    ? coerceRichTextDocument(data.content_es)
                    : null,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
