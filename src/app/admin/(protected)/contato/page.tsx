import { AdminPageHeader } from "@/components/admin/admin-list";
import { ContactSettingsForm } from "@/components/admin/contact-settings-form";
import { createClient } from "@/lib/supabase/server";

export default async function AdminContactPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="space-y-4">
        <AdminPageHeader
          title="Contato"
          description="Atualize e-mail, telefone, redes sociais e o texto introdutório da página pública de contato."
        />
        <p className="text-sm text-destructive">
          Não foi possível carregar as configurações. Aplique a migration
          `contact_and_settings` no Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Contato"
        description="Atualize e-mail, telefone, redes sociais, o texto introdutório da página pública de contato e a imagem de fallback do blog."
      />
      <ContactSettingsForm
        settings={{
          id: data.id,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          intro_pt: data.intro_pt,
          intro_en: data.intro_en,
          intro_fr: data.intro_fr,
          social_links: data.social_links as Array<{
            label: string;
            url: string;
          }> | null,
          blog_fallback_cover_path: data.blog_fallback_cover_path,
        }}
      />
    </div>
  );
}
