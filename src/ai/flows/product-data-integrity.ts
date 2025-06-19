
'use server';

/**
 * @fileOverview A GenAI-powered tool that identifies and flags or corrects inconsistent data in the product catalog.
 *
 * - correctProductData - A function that handles the product data correction process.
 * - CorrectProductDataInput - The input type for the correctProductData function.
 * - CorrectProductDataOutput - The return type for the correctProductData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductDataSchema = z.object({
  id: z.string().describe('Unique identifier of the product'),
  name: z.string().nullable().describe('Name of the product'),
  description: z.string().nullable().describe('Description of the product'),
  image: z.string().nullable().describe('URL of the product image'),
  category: z.string().nullable().describe('Category of the product'),
  datahint: z.string().nullable().describe('Unused field'),
  is_active: z.boolean().describe('Whether the product is active'),
  created_at: z.string().datetime({ message: "Invalid datetime string. Must be an ISO 8601 string." }).nullable().describe('ISO 8601 timestamp of creation.'),
});

const CorrectedProductDataSchema = z.object({
  id: z.string().describe('Unique identifier of the product'),
  name: z.string().describe('Name of the product'),
  description: z.string().nullable().describe('Description of the product'),
  image: z.string().describe('URL of the product image'),
  category: z.string().describe('Category of the product'),
  datahint: z.string().nullable().describe('Unused field'),
  is_active: z.boolean().describe('Whether the product is active'),
  created_at: z.string().datetime({ message: "Invalid datetime string. Must be an ISO 8601 string." }).nullable().describe('ISO 8601 timestamp of creation. Should be preserved if valid, or set to null if invalid or missing.'),
});


const CorrectProductDataInputSchema = z.object({
  productData: z.array(ProductDataSchema).describe('Array of product objects to check for data integrity'),
});
export type CorrectProductDataInput = z.infer<typeof CorrectProductDataInputSchema>;

const CorrectProductDataOutputSchema = z.object({
  correctedProductData: z.array(CorrectedProductDataSchema).describe('Array of corrected product objects'),
  correctionsSummary: z.string().describe('Summary of the corrections made'),
});
export type CorrectProductDataOutput = z.infer<typeof CorrectProductDataOutputSchema>;

export async function correctProductData(input: CorrectProductDataInput): Promise<CorrectProductDataOutput> {
  return correctProductDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctProductDataPrompt',
  input: {schema: CorrectProductDataInputSchema},
  output: {schema: CorrectProductDataOutputSchema},
  prompt: `You are an expert in data quality and consistency. You are provided with an array of product data objects. Your task is to identify and correct any inconsistencies in the data, such as null or empty values for name, image, or category. Also, standardize the category field by trimming whitespace and converting to uppercase.

  Here is the product data:
  {{#each productData}}
  Product ID: {{this.id}}
  Name: {{this.name}}
  Description: {{this.description}}
  Image: {{this.image}}
  Category: {{this.category}}
  Is Active: {{this.is_active}}
  Created At (ISO 8601 Timestamp): {{this.created_at}}
  \n---\n{{/each}}

  Return the corrected product data as an array of objects, ensuring that:
  - All products have a non-null and non-empty name. If name is missing, use "Unknown Product".
  - All products have a non-null and non-empty image URL. If image is missing, use "https://placehold.co/300x300.png".
  - All products have a non-null and non-empty category, trimmed and in uppercase. If category is missing, use "UNCATEGORIZED".
  - 'is_active' is a boolean; default to true if null or missing.
  - 'created_at' is an ISO 8601 timestamp string or null. Preserve valid timestamps. If 'created_at' is invalid or unparsable as an ISO 8601 timestamp, set it to null. Do not generate new timestamps for 'created_at'.

  Also, provide a summary of the corrections you made.

  Ensure the output is a valid JSON.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const correctProductDataFlow = ai.defineFlow(
  {
    name: 'correctProductDataFlow',
    inputSchema: CorrectProductDataInputSchema,
    outputSchema: CorrectProductDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
