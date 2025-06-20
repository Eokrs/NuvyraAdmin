
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/types";
import { correctProductData, type CorrectProductDataInput, type CorrectProductDataOutput } from "@/ai/flows/product-data-integrity";
import { revalidatePath } from "next/cache";

export async function fetchAndCorrectDataAction(): Promise<{ data?: { originalProducts: Product[], aiOutput: CorrectProductDataOutput }, error?: string }> {
  const supabase = createSupabaseServerClient();
  const { data: products, error: fetchError } = await supabase.from("products").select("*");

  if (fetchError) {
    console.error("Error fetching products for AI correction:", fetchError);
    return { error: "Falha ao buscar produtos: " + fetchError.message };
  }

  if (!products || products.length === 0) {
    return { data: { originalProducts: [], aiOutput: { correctedProductData: [], correctionsSummary: "Nenhum produto encontrado para verificar." } } };
  }

  const aiInput: CorrectProductDataInput = {
    productData: products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      image: p.image,
      category: p.category,
      price: p.price, // Include price
      datahint: p.datahint, 
      is_active: p.is_active,
      created_at: p.created_at,
    }))
  };

  try {
    const aiOutput = await correctProductData(aiInput);
    return { data: { originalProducts: products as Product[], aiOutput } };
  } catch (aiError: any) {
    console.error("AI correction error:", aiError);
    return { error: "Falha no processamento da IA: " + (aiError.message || "Erro desconhecido") };
  }
}

export async function applyCorrectedDataAction(correctedProducts: Product[]): Promise<{ success?: boolean, error?: string, count?: number }> {
  if (!correctedProducts || correctedProducts.length === 0) {
    return { error: "Nenhum produto corrigido para aplicar." };
  }

  const supabase = createSupabaseServerClient();
  let updatedCount = 0;
  
  const updatePromises = correctedProducts.map(product => {
    const isActive = typeof product.is_active === 'string' ? product.is_active.toLowerCase() === 'true' : Boolean(product.is_active);
    
    return supabase
      .from("products")
      .update({
        name: product.name,
        description: product.description,
        image: product.image,
        category: product.category,
        price: product.price, // Include price
        is_active: isActive,
        created_at: product.created_at,
      })
      .eq("id", product.id);
  });

  try {
    const results = await Promise.all(updatePromises);
    results.forEach(result => {
      if (!result.error) {
        updatedCount++;
      } else {
        console.error("Error updating product during batch apply:", result.error);
      }
    });

    if (updatedCount > 0) {
      revalidatePath("/admin/products");
      revalidatePath("/admin/data-integrity");
    }
    
    if (updatedCount === correctedProducts.length) {
      return { success: true, count: updatedCount };
    } else {
      return { error: `Falha ao atualizar ${correctedProducts.length - updatedCount} de ${correctedProducts.length} produtos. Verifique os logs.`, count: updatedCount };
    }

  } catch (batchError: any) {
    console.error("Batch update error:", batchError);
    return { error: "Erro geral ao aplicar correções em lote: " + (batchError.message || "Erro desconhecido") };
  }
}
