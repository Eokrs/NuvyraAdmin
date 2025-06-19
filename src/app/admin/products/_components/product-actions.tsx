
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
import { MoreHorizontal, Edit3, Trash2, Eye, EyeOff, ToggleLeft, ToggleRight } from 'lucide-react';
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
      toast({ title: "Produto 'deletado'", description: "O produto foi marcado como inativo e não visível." });
      router.refresh(); // Refresh data on the page
    } else {
      toast({ title: "Erro ao 'deletar'", description: result.error, variant: "destructive" });
    }
    setIsDeleteDialogOpen(false);
  };

  const handleToggleStatus = async (field: 'is_active' | 'is_visible') => {
    setIsStatusToggling(true);
    const newValue = !product[field];
    const result = await toggleProductStatusAction(product.id, field, newValue);
    if (result.success) {
      toast({ title: "Status atualizado!", description: `Produto ${product.name} ${field === 'is_active' ? (newValue ? 'ativado' : 'desativado') : (newValue ? 'tornado visível' : 'tornado oculto')}.` });
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
              <Edit3 className="mr-2 h-4 w-4 text-blue-400" />
              Editar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleToggleStatus('is_active')} disabled={isStatusToggling} className="cursor-pointer">
            {product.is_active ? (
              <ToggleLeft className="mr-2 h-4 w-4 text-red-400" />
            ) : (
              <ToggleRight className="mr-2 h-4 w-4 text-green-400" />
            )}
            {product.is_active ? 'Desativar' : 'Ativar'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleToggleStatus('is_visible')} disabled={isStatusToggling} className="cursor-pointer">
            {product.is_visible ? (
              <EyeOff className="mr-2 h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="mr-2 h-4 w-4 text-sky-400" />
            )}
            {product.is_visible ? 'Ocultar' : 'Mostrar'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar (Inativar)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar "Deleção"</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja "deletar" o produto "{product.name}"? Esta ação irá marcar o produto como inativo e não visível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirmar "Deleção"
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

