
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { SiteSettings, SiteSettingsFormData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { updateSiteSettingsAction } from "../actions";
import { Loader2, Save } from "lucide-react";
import React, { useState } from "react";

const settingsFormSchema = z.object({
  site_name: z.string().min(2, "O nome do site deve ter pelo menos 2 caracteres."),
  default_seo_title: z.string().min(2, "O título SEO deve ter pelo menos 2 caracteres."),
  default_seo_description: z.string().max(160, "A descrição SEO não pode exceder 160 caracteres.").min(10, "A descrição SEO deve ter pelo menos 10 caracteres."),
  seo_keywords: z.string().optional(),
  banner_images: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsFormProps {
  initialData: SiteSettings;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const defaultValues = {
      site_name: initialData.site_name || "",
      default_seo_title: initialData.default_seo_title || "",
      default_seo_description: initialData.default_seo_description || "",
      seo_keywords: initialData.seo_keywords?.join(', ') || "",
      banner_images: initialData.banner_images?.join('\n') || "",
  };

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: SettingsFormValues) => {
    setLoading(true);
    try {
      const payload: SiteSettingsFormData = {
        site_name: data.site_name,
        default_seo_title: data.default_seo_title,
        default_seo_description: data.default_seo_description,
        seo_keywords: data.seo_keywords || "",
        banner_images: data.banner_images || "",
      };

      const result = await updateSiteSettingsAction(initialData.id, payload);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "As configurações do site foram atualizadas.",
        });
        router.refresh();
      } else {
        toast({
          title: "Erro ao salvar",
          description: result.error || "Ocorreu um erro desconhecido.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive",
      });
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-xl bg-card">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Configurações Gerais e SEO</CardTitle>
        <CardDescription>Ajuste as configurações globais do seu site.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="site_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Site</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nuvyra Store" {...field} className="bg-input/50 focus:bg-input/70" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="default_seo_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título SEO Padrão</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nuvyra Store - Roupas e Acessórios" {...field} className="bg-input/50 focus:bg-input/70" />
                  </FormControl>
                  <FormDescription>O título que aparece na aba do navegador e nos resultados de busca.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="default_seo_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição SEO Padrão</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição concisa do seu site para os motores de busca."
                      className="resize-y min-h-[100px] bg-input/50 focus:bg-input/70"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seo_keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Palavras-chave SEO</FormLabel>
                  <FormControl>
                     <Input 
                        placeholder="roupas, moda, nuvyra, acessórios" 
                        {...field}
                        className="bg-input/50 focus:bg-input/70"
                      />
                  </FormControl>
                   <FormDescription>Separe as palavras-chave por vírgula (,).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="banner_images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URLs das Imagens do Banner Principal</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="https://exemplo.com/imagem1.png\nhttps://exemplo.com/imagem2.png"
                      className="resize-y min-h-[120px] bg-input/50 focus:bg-input/70 font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Insira uma URL de imagem por linha.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-6">
              <Button type="submit" disabled={loading} className="min-w-[180px] bg-primary hover:bg-primary/90 text-primary-foreground">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
