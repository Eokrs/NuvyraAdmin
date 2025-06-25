
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
import { uploadImageToImgur } from "@/lib/image-utils";
import { Loader2, Save, Upload } from "lucide-react";
import React, { useState, useRef } from "react";
import NextImage from "next/image";
import { cn } from "@/lib/utils";

const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do produto deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().max(500, {
    message: "A descrição não pode exceder 500 caracteres.",
  }).nullable().optional(),
  image: z.string().url({ message: "É necessária uma URL de imagem válida. Por favor, envie uma imagem." }),
  category: z.string().min(1, {
    message: "A categoria é obrigatória.",
  }),
  price: z.coerce.number().min(0, { // coerce to number and ensure non-negative
    message: "O preço deve ser um número não negativo.",
  }),
  is_active: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Product | null;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData?.image || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const defaultValues = initialData
    ? {
        name: initialData.name || "",
        description: initialData.description || "",
        image: initialData.image || "",
        category: initialData.category || "",
        price: initialData.price ?? 0, // Default to 0 if null or undefined
        is_active: Boolean(initialData.is_active),
      }
    : {
        name: "",
        description: "",
        image: "",
        category: "",
        price: 0,
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
        price: data.price,
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
        router.refresh();
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
  
  const convertImageToPng = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            if (!event.target?.result) {
              return reject(new Error("Falha ao ler o arquivo de imagem."));
            }
            img.src = event.target.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Não foi possível obter o contexto do canvas.'));
                }
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
  };

  const processAndUploadFile = async (file: File | null | undefined) => {
    if (!file) return;

    const acceptedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    if (!acceptedTypes.includes(file.type)) {
      toast({ title: "Tipo de Arquivo Inválido", description: "Por favor, selecione uma imagem (PNG, JPG, GIF, WEBP).", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ title: "Arquivo Muito Grande", description: "O tamanho da imagem não pode exceder 10MB.", variant: "destructive" });
        return;
    }

    setIsUploading(true);
    try {
        const pngDataUri = await convertImageToPng(file);
        const newUrl = await uploadImageToImgur(pngDataUri);
        
        form.setValue("image", newUrl, { shouldValidate: true });
        setImageUrl(newUrl);
        toast({ title: "Sucesso!", description: "Imagem convertida para PNG e enviada." });

    } catch (error: any) {
        console.error("Image conversion/upload error:", error);
        toast({ title: "Erro no Upload", description: `Não foi possível enviar a imagem: ${error.message}`, variant: "destructive" });
    } finally {
        setIsUploading(false);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processAndUploadFile(file);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Necessary to allow drop.
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    processAndUploadFile(file);
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
                  <FormLabel>Imagem do Produto</FormLabel>
                  <FormControl>
                    <Input type="hidden" {...field} value={field.value || ""} />
                  </FormControl>
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={cn(
                        "group relative grid h-72 w-full place-items-center rounded-lg border-2 border-dashed transition-colors",
                        isDragging && !isUploading ? "border-primary bg-primary/10" : "border-border",
                        !isUploading && "cursor-pointer hover:border-primary/70"
                    )}
                  >
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        className="hidden"
                        disabled={isUploading}
                    />

                    {isUploading && (
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="font-medium">Enviando imagem...</p>
                        </div>
                    )}
                    
                    {!isUploading && imageUrl && (
                         <>
                            <NextImage
                              src={imageUrl}
                              alt="Preview da Imagem"
                              layout="fill"
                              objectFit="contain"
                              className="rounded-md p-2"
                              data-ai-hint="product preview"
                            />
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                <Upload className="h-8 w-8"/>
                                <p className="font-semibold">Trocar Imagem</p>
                                <p className="text-sm">Arraste um novo arquivo ou clique</p>
                            </div>
                        </>
                    )}

                    {!isUploading && !imageUrl && (
                        <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                            <Upload className="h-8 w-8" />
                            <p className="font-semibold">
                              {isDragging ? 'Solte para enviar!' : 'Arraste e solte uma imagem aqui'}
                            </p>
                            <p className="text-sm">ou clique para selecionar um arquivo</p>
                            <p className="mt-2 text-xs">PNG, JPG, GIF ou WEBP (Max 10MB)</p>
                        </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: ROUPAS" {...field} className="bg-input/50 focus:bg-input/70" />
                    </FormControl>
                    <FormDescription>A categoria será normalizada.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 29.99" 
                        {...field} 
                        step="0.01"
                        className="bg-input/50 focus:bg-input/70" 
                        onChange={event => field.onChange(+event.target.value)} // Ensure value is number
                      />
                    </FormControl>
                    <FormDescription>Use ponto como separador decimal.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-input/30">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              <Button type="submit" disabled={loading || isUploading} className="min-w-[150px] bg-primary hover:bg-primary/90 text-primary-foreground">
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
