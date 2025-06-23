
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/types";
import { SettingsForm } from "./_components/settings-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, SettingsIcon } from "lucide-react";

async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = createSupabaseServerClient();
  // We assume there's only one row of settings, with id = 1
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error fetching site settings:", error);
    return null;
  }
  return data as SiteSettings;
}

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight flex items-center">
            <SettingsIcon className="mr-3 h-8 w-8 text-accent" />
            Configurações do Site
          </h1>
          <p className="text-muted-foreground">
            Gerencie as configurações globais, SEO e aparência do seu site.
          </p>
        </div>
      </div>
      
      {settings ? (
        <SettingsForm initialData={settings} />
      ) : (
        <Alert variant="destructive" className="max-w-xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Configurações não encontradas</AlertTitle>
          <AlertDescription>
            Não foi possível carregar as configurações do site. Verifique se a tabela `site_settings` contém uma linha com `id = 1`.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
