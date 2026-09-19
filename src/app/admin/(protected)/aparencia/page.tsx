import { AdminPageHeader } from "@/components/admin/admin-list";
import { AppearanceForm } from "@/components/admin/appearance-form";
import { FALLBACK_SITE_THEME, parseSiteTheme } from "@/lib/site-theme";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAppearancePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("default_theme")
    .limit(1)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Aparência"
        description="Escolha em que tema o site público abre: claro, escuro ou o do aparelho de quem visita."
      />
      {error ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar as configurações do site.
        </p>
      ) : (
        <AppearanceForm
          defaultTheme={
            parseSiteTheme(data?.default_theme) ?? FALLBACK_SITE_THEME
          }
        />
      )}
    </div>
  );
}
