
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { ProductsDataTable } from './_components/products-data-table';
import { columns } from './_components/columns';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const revalidate = 0; // Disable caching for this page

async function getProducts(
  filters: { category?: string; isActive?: string; },
  sortBy: string = 'name',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<Product[]> {
  const supabase = createSupabaseServerClient();
  let query = supabase.from('products').select('*');

  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive === 'true');
  }
  
  const sortField = sortBy === 'created_at' ? 'created_at' : 'name';
  query = query.order(sortField, { ascending: sortOrder === 'asc' });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data as Product[];
}

interface ProductsPageProps {
  searchParams: {
    category?: string;
    isActive?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = {
    category: searchParams.category,
    isActive: searchParams.isActive,
  };
  const products = await getProducts(filters, searchParams.sortBy, searchParams.sortOrder);

  const supabase = createSupabaseServerClient();
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('products')
    .select('category')
    .neq('category', ''); 
    
  let uniqueCategories: string[] = [];
  if (categoriesData && !categoriesError) {
    const allCategories = categoriesData.map(p => p.category?.trim().toUpperCase()).filter(Boolean);
    uniqueCategories = [...new Set(allCategories as string[])].sort();
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Gerenciamento de Produtos</h1>
          <p className="text-muted-foreground">Visualize, crie, edite e gerencie os produtos da Nuvyra Store.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Adicionar Produto
          </Link>
        </Button>
      </div>
      
      <ProductsDataTable columns={columns} data={products} uniqueCategories={uniqueCategories} />
    </div>
  );
}
