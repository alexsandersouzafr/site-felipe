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
        description="Atualize e-mail, telefone, redes sociais e o texto introdutório da página pública de contato. Essas informações são as que os visitantes veem ao entrar em contato."
      />
      <ContactSettingsForm
        settings={{
          id: data.id,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          intro_pt: data.intro_pt,
          intro_en: data.intro_en,
          intro_es: data.intro_es,
          social_links: data.social_links as Array<{
            label: string;
            url: string;
          }> | null,
        }}
      />
    </div>
  );
}
