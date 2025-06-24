
"use server";

import type { Product } from "@/types";
import { type CorrectProductDataOutput } from "@/ai/flows/product-data-integrity";

export async function fetchAndCorrectDataAction(): Promise<{ data?: { originalProducts: Product[], aiOutput: CorrectProductDataOutput }, error?: string }> {
  // This feature is temporarily disabled.
  return { error: "Recurso de verificação de dados de IA está temporariamente desativado devido a problemas de dependência." };
}

export async function applyCorrectedDataAction(correctedProducts: Product[]): Promise<{ success?: boolean, error?: string, count?: number }> {
    // This feature is temporarily disabled.
    return { error: "Recurso de verificação de dados de IA está temporariamente desativado." };
}
