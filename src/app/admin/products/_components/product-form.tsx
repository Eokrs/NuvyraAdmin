
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Product, ProductFormData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductAction } from "../actions";
import { Loader2, Save, Image as ImageIcon } from "lucide-react";
import React, { useState } from "react";
import NextImage from "next/image";

const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do produto deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().max(500, {
    message: "A descrição não pode exceder 500 caracteres.",
  }).nullable().optional(),
  image: z.string().url({ message: "Por favor, insira uma URL válida para a imagem." }),
  category: z.string().min(1, {
    message: "A categoria é obrigatória.",
  }),
  is_active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Product | null;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData?.image || "");

  const defaultValues = initialData
    ? {
        name: initialData.name || "",
        description: initialData.description || "",
        image: initialData.image || "",
        category: initialData.category || "",
        is_active: initialData.is_active,
      }
    : {
        name: "",
        description: "",
        image: "",
        category: "",
        is_active: true,
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  const title = initialData ? "Editar Produto" : "Criar Novo Produto";
  const description = initialData ? "Atualize os detalhes do produto." : "Preencha o formulário para adicionar um novo produto.";
  const actionLabel = initialData ? "Salvar Alterações" : "Criar Produto";

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    try {
      const payload: ProductFormData = {
        name: data.name,
        description: data.description || undefined,
        image: data.image,
        category: data.category,
        is_active: data.is_active,
      };

      let result;
      if (initialData && initialData.id) {
        result = await updateProductAction(initialData.id, payload);
      } else {
        result = await createProductAction(payload);
      }

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
        router.push("/admin/products");
        router.refresh(); // Ensures the list page is updated
      } else {
        toast({
          title: "Erro ao salvar produto",
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
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    form.setValue("image", url, { shouldValidate: true }); // Update RHF state
    setImageUrl(url); // Update local state for preview
  };


  return (
    <Card className="max-w-3xl mx-auto shadow-xl bg-card">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Camiseta Nuvyra Pro" {...field} className="bg-input/50 focus:bg-input/70" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes sobre o produto..."
                      className="resize-y min-h-[100px] bg-input/50 focus:bg-input/70"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                     <Input 
                        placeholder="https://exemplo.com/imagem.png" 
                        {...field} 
                        onChange={handleImageChange} // Use custom handler
                        value={imageUrl} // Controlled by local state for preview
                        className="bg-input/50 focus:bg-input/70"
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {imageUrl && (
              <div className="mt-2 p-2 border rounded-md border-border bg-muted/20">
                <FormLabel className="text-sm text-muted-foreground">Preview da Imagem:</FormLabel>
                <div className="relative w-full h-64 mt-1 overflow-hidden rounded-md shadow-inner">
                  <NextImage
                    src={imageUrl}
                    alt="Preview da Imagem"
                    layout="fill"
                    objectFit="contain"
                    onError={() => {
                      // Optionally handle image load error, e.g., show placeholder
                      // console.warn("Image preview error");
                    }}
                    data-ai-hint="product preview"
                  />
                </div>
              </div>
            )}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: ROUPAS" {...field} className="bg-input/50 focus:bg-input/70" />
                  </FormControl>
                  <FormDescription>A categoria será normalizada (sem espaços extras, maiúsculas).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-input/30">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Produto Ativo</FormLabel>
                    <FormDescription>
                      Define se o produto está disponível para venda.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-6">
              <Button type="submit" disabled={loading} className="min-w-[150px] bg-primary hover:bg-primary/90 text-primary-foreground">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {actionLabel}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
