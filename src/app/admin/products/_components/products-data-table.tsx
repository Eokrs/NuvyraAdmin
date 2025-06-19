
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, Filter, RefreshCw, Trash2 } from "lucide-react";
import type { Product } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { bulkDeleteProductsAction, bulkToggleProductStatusAction } from "../actions";
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

interface ProductsDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  uniqueCategories: string[];
}

export function ProductsDataTable<TData extends Product, TValue>({
  columns,
  data,
  uniqueCategories,
}: ProductsDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = React.useState(false);
  const [bulkActionType, setBulkActionType] = React.useState<'delete' | 'activate' | 'deactivate' | null>(null);


  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: { pageSize: 10 },
    }
  });

  const updateQueryParam = (key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value === null || value === "") {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  const handleBulkAction = async () => {
    if (!bulkActionType) return;

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast({ title: "Nenhum produto selecionado", description: "Selecione produtos para realizar a ação.", variant: "destructive" });
      return;
    }
    const productIds = selectedRows.map(row => row.original.id);

    let result;
    if (bulkActionType === 'delete') {
      result = await bulkDeleteProductsAction(productIds);
    } else if (bulkActionType === 'activate') {
      result = await bulkToggleProductStatusAction(productIds, true);
    } else if (bulkActionType === 'deactivate') {
      result = await bulkToggleProductStatusAction(productIds, false);
    }

    if (result?.success) {
      toast({ title: "Sucesso!", description: result.message });
      table.resetRowSelection(); // Clear selection
      router.refresh(); // Refresh data
    } else {
      toast({ title: "Erro", description: result?.error || "Falha ao executar ação em massa.", variant: "destructive" });
    }
    setIsBulkDeleteDialogOpen(false);
    setBulkActionType(null);
  };

  const confirmBulkAction = (type: 'delete' | 'activate' | 'deactivate') => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast({ title: "Nenhum produto selecionado", description: "Selecione produtos para realizar a ação.", variant: "destructive" });
      return;
    }
    setBulkActionType(type);
    setIsBulkDeleteDialogOpen(true);
  };


  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Filtrar por nome..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm h-10 bg-input/50 focus:bg-input/70"
        />
        <Select
          value={searchParams.get('category') || ""}
          onValueChange={(value) => updateQueryParam('category', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[180px] h-10 bg-input/50 focus:bg-input/70">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {uniqueCategories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={searchParams.get('isActive') || ""}
          onValueChange={(value) => updateQueryParam('isActive', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[130px] h-10 bg-input/50 focus:bg-input/70">
            <SelectValue placeholder="Status Ativo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Ativo</SelectItem>
            <SelectItem value="false">Inativo</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 ml-auto">
              Colunas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id === 'name' ? 'Nome' : 
                     column.id === 'image' ? 'Imagem' : 
                     column.id === 'category' ? 'Categoria' :
                     column.id === 'is_active' ? 'Ativo' :
                     column.id === 'created_at' ? 'Criado em' :
                     column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" onClick={() => router.refresh()} className="h-10">
            <RefreshCw className="h-4 w-4 mr-2"/> Atualizar
        </Button>
      </div>

      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center gap-2 p-2.5 border rounded-md bg-card">
            <span className="text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} de {" "}
                {table.getCoreRowModel().rows.length} linha(s) selecionadas.
            </span>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="ml-auto">Ações em Massa <ChevronDown className="ml-2 h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aplicar para selecionados</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => confirmBulkAction('activate')}>Ativar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => confirmBulkAction('deactivate')}>Desativar</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => confirmBulkAction('delete')} className="text-destructive focus:text-destructive">
                    Excluir Permanentemente
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      )}

      <div className="rounded-md border shadow-lg bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-muted/5">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-foreground/80">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/10 data-[state=selected]:bg-primary/10"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próxima
        </Button>
      </div>
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Ação em Massa</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja{' '}
              {bulkActionType === 'delete' ? 'excluir permanentemente' : bulkActionType === 'activate' ? 'ativar' : 'desativar'}{' '}
              os {table.getFilteredSelectedRowModel().rows.length} produtos selecionados?
              {bulkActionType === 'delete' && " Esta ação não poderá ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAction}
              className={bulkActionType === 'delete' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
