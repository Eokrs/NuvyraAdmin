
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SiteSettingsFormData } from "@/types";

const SettingsSchema = z.object({
  site_name: z.string().min(1, "Nome do site é obrigatório."),
  default_seo_title: z.string().min(1, "Título SEO é obrigatório."),
  default_seo_description: z.string().min(1, "Descrição SEO é obrigatória."),
  seo_keywords: z.string().optional(),
  banner_images: z.string().optional(),
});

export async function updateSiteSettingsAction(id: number, formData: SiteSettingsFormData) {
  const supabase = createSupabaseServerClient();

  const validatedFields = SettingsSchema.safeParse(formData);
  if (!validatedFields.success) {
    return {
      error: "Erro de validação: " + JSON.stringify(validatedFields.error.flatten().fieldErrors),
    };
  }

  const { site_name, default_seo_title, default_seo_description, seo_keywords, banner_images } = validatedFields.data;

  // Convert comma-separated string to array of strings for keywords
  const keywordsArray = seo_keywords 
    ? seo_keywords.split(',').map(kw => kw.trim()).filter(kw => kw.length > 0)
    : [];

  // Convert newline-separated string to array of URLs
  const imagesArray = banner_images
    ? banner_images.split('\n').map(url => url.trim()).filter(url => url.length > 0)
    : [];

  const settingsDataToUpdate = {
    site_name,
    default_seo_title,
    default_seo_description,
    seo_keywords: keywordsArray,
    banner_images: imagesArray,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("site_setting")
    .update(settingsDataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Supabase error updating site settings:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/settings");

  return { success: true, message: "Configurações do site atualizadas com sucesso!", settings: data };
}
