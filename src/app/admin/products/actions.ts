
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProductFormData } from "@/types";
import { convertToImgurUrl } from "@/lib/image-utils";

const ProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  description: z.string().max(500, "A descrição não pode exceder 500 caracteres.").nullable().optional(),
  image: z.string().min(1, "URL da Imagem é obrigatória.").url("URL da imagem inválida."),
  category: z.string().min(1, "Categoria é obrigatória."),
  is_active: z.boolean(),
});

// Helper function to normalize category
const normalizeCategory = (category: string) => {
  return category.trim().toUpperCase();
};

export async function createProductAction(formData: ProductFormData) {
  const supabase = createSupabaseServerClient();
  
  const validatedFields = ProductSchema.safeParse(formData);
  if (!validatedFields.success) {
    return {
      error: "Erro de validação: " + JSON.stringify(validatedFields.error.flatten().fieldErrors),
    };
  }

  const { name, description, category, is_active } = validatedFields.data;
  let originalImageUrl = validatedFields.data.image;
  let finalImageUrl = originalImageUrl;

  if (originalImageUrl.startsWith('https://jmdy.shop')) {
    finalImageUrl = await convertToImgurUrl(originalImageUrl);
  }
  
  const normalizedCat = normalizeCategory(category);
  
  const productDataToInsert = { 
    name,
    description: description ?? null, 
    image: finalImageUrl,
    category: normalizedCat, 
    is_active,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("products")
    .insert([productDataToInsert])
    .select()
    .single();

  if (error) {
    console.error("Supabase error creating product:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  
  let successMessage = "Produto criado com sucesso!";
  if (finalImageUrl !== originalImageUrl) {
      successMessage = "Produto criado e imagem convertida para Imgur com sucesso!";
  } else if (originalImageUrl.startsWith('https://jmdy.shop') && finalImageUrl === originalImageUrl && process.env.IMGUR_CLIENT_ID) {
      successMessage = "Produto criado com sucesso! (Falha ao converter imagem para Imgur, URL original mantida)";
  } else if (originalImageUrl.startsWith('https://jmdy.shop') && !process.env.IMGUR_CLIENT_ID) {
      successMessage = "Produto criado com sucesso! (Conversão para Imgur não realizada: IMGUR_CLIENT_ID não configurado)";
  }

  return { success: true, message: successMessage, product: data };
}

export async function updateProductAction(id: string, formData: ProductFormData) {
  const supabase = createSupabaseServerClient();

  const validatedFields = ProductSchema.safeParse(formData);
  if (!validatedFields.success) {
    return {
      error: "Erro de validação: " + JSON.stringify(validatedFields.error.flatten().fieldErrors),
    };
  }
  
  const { name, description, category } = validatedFields.data;
  const isActiveValue = Boolean(formData.is_active); // Ensure boolean
  let originalImageUrl = validatedFields.data.image;
  let finalImageUrl = originalImageUrl;

  if (originalImageUrl.startsWith('https://jmdy.shop')) {
    finalImageUrl = await convertToImgurUrl(originalImageUrl);
  }
  
  const normalizedCat = normalizeCategory(category);

  const productDataToUpdate = { 
    name: name,
    description: description ?? null,
    image: finalImageUrl,
    category: normalizedCat,
    is_active: isActiveValue,
  };

  const { data, error } = await supabase
    .from("products")
    .update(productDataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Supabase error updating product:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/edit/${id}`);

  let successMessage = "Produto atualizado com sucesso!";
  if (finalImageUrl !== originalImageUrl) {
      successMessage = "Produto atualizado e imagem convertida para Imgur com sucesso!";
  } else if (originalImageUrl.startsWith('https://jmdy.shop') && finalImageUrl === originalImageUrl && process.env.IMGUR_CLIENT_ID) {
      successMessage = "Produto atualizado com sucesso! (Falha ao converter imagem para Imgur, URL original mantida)";
  } else if (originalImageUrl.startsWith('https://jmdy.shop') && !process.env.IMGUR_CLIENT_ID) {
      successMessage = "Produto atualizado com sucesso! (Conversão para Imgur não realizada: IMGUR_CLIENT_ID não configurado)";
  }

  return { success: true, message: successMessage, product: data };
}

export async function deleteProductAction(id: string) {
  // Soft delete: set is_active to false
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    console.error("Supabase error 'deleting' product:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  return { success: true, message: "Produto 'deletado' (inativado) com sucesso." };
}

export async function toggleProductStatusAction(id: string, field: 'is_active', value: boolean) {
  if (field !== 'is_active') {
    return { error: "Campo inválido para alternar status." };
  }
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({ [field]: value })
    .eq("id", id);

  if (error) {
    console.error(`Supabase error toggling ${field}:`, error);
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  return { success: true, message: `Status do produto atualizado.` };
}


export async function bulkDeleteProductsAction(productIds: string[]) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .in("id", productIds);

  if (error) {
    console.error("Supabase error bulk 'deleting' products:", error);
    return { error: error.message };
  }
  revalidatePath("/admin/products");
  return { success: true, message: `${productIds.length} produto(s) 'deletado(s)' com sucesso.` };
}

export async function bulkToggleProductStatusAction(productIds: string[], isActive: boolean) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .in("id", productIds);
  
  if (error) {
    console.error("Supabase error bulk toggling product status:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  return { success: true, message: `${productIds.length} produto(s) tiveram seu status 'ativo' atualizado.` };
}
