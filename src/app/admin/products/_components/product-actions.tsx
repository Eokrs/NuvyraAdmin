
"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit3, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { deleteProductAction, toggleProductStatusAction } from '../actions';

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isStatusToggling, setIsStatusToggling] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    const result = await deleteProductAction(product.id);
    if (result.success) {
      toast({ title: "Produto Excluído", description: "O produto foi excluído permanentemente." });
      router.refresh(); // Refresh data on the page
    } else {
      toast({ title: "Erro ao Excluir", description: result.error, variant: "destructive" });
    }
    setIsDeleteDialogOpen(false);
  };

  const handleToggleIsActive = async () => {
    setIsStatusToggling(true);
    const newValue = !product.is_active;
    const result = await toggleProductStatusAction(product.id, 'is_active', newValue);
    if (result.success) {
      toast({ title: "Status atualizado!", description: `Produto ${product.name} ${newValue ? 'ativado' : 'desativado'}.` });
      router.refresh();
    } else {
      toast({ title: "Erro ao atualizar status", description: result.error, variant: "destructive" });
    }
    setIsStatusToggling(false);
  };


  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card border-border shadow-lg">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/admin/products/edit/${product.id}`} className="flex items-center cursor-pointer">
              <Edit3 className="mr-2 h-4 w-4 text-accent" />
              Editar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleIsActive} disabled={isStatusToggling} className="cursor-pointer">
            {product.is_active ? (
              <ToggleLeft className="mr-2 h-4 w-4 text-destructive" />
            ) : (
              <ToggleRight className="mr-2 h-4 w-4 text-accent" />
            )}
            {product.is_active ? 'Desativar' : 'Ativar'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Permanentemente
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão Permanente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente o produto "{product.name}"? Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
