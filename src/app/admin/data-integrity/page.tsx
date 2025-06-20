
"use client";

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckSquare, Loader2, ShieldAlert, Sparkles, Diff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';
import { CorrectProductDataOutput } from '@/ai/flows/product-data-integrity';
import { applyCorrectedDataAction, fetchAndCorrectDataAction } from './actions';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface CorrectionDetail {
  id: string;
  original: Product;
  // Corrected type can be inferred from CorrectedProductDataSchema from the AI flow if needed,
  // but for simplicity here, we'll assume it aligns with Product structure after correction
  corrected: Product; 
  changes: string[];
}

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) {
    return "N/A";
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
};

export default function DataIntegrityPage() {
  const [isScanning, startScanTransition] = useTransition();
  const [isApplying, startApplyTransition] = useTransition();
  const [scanResult, setScanResult] = useState<CorrectProductDataOutput | null>(null);
  const [detailedCorrections, setDetailedCorrections] = useState<CorrectionDetail[]>([]);
  const { toast } = useToast();

  const handleScanData = () => {
    startScanTransition(async () => {
      try {
        const result = await fetchAndCorrectDataAction();
        if (result.error) {
          toast({ title: "Erro na Verificação", description: result.error, variant: "destructive" });
          setScanResult(null);
          setDetailedCorrections([]);
        } else if (result.data) {
          setScanResult(result.data.aiOutput);
          
          const details: CorrectionDetail[] = [];
          result.data.aiOutput.correctedProductData.forEach(correctedProdUntyped => {
            const correctedProd = correctedProdUntyped as Product; // Cast to Product for simplicity
            const originalProd = result.data.originalProducts.find(p => p.id === correctedProd.id);
            if (originalProd) {
              const changes: string[] = [];
              // Iterate over keys present in originalProd (which conforms to Product)
              (Object.keys(originalProd) as Array<keyof Product>).forEach(key => {
                if (key in correctedProd && originalProd[key] !== correctedProd[key as keyof typeof correctedProd]) {
                   let originalValue = originalProd[key];
                   let correctedValue = correctedProd[key as keyof typeof correctedProd];
                   if (key === 'price') {
                     originalValue = formatCurrency(originalValue as number | null);
                     correctedValue = formatCurrency(correctedValue as number | null);
                   }
                   changes.push(`${key}: '${originalValue ?? "N/A"}' -> '${correctedValue ?? "N/A"}'`);
                }
              });
               // Special check for is_active as it's boolean
              if ('is_active' in correctedProd && originalProd.is_active !== correctedProd.is_active) {
                if (!changes.some(c => c.startsWith('is_active:'))) { // Avoid duplicate
                  changes.push(`is_active: '${originalProd.is_active}' -> '${correctedProd.is_active}'`);
                }
              }

              if (changes.length > 0) {
                details.push({ id: correctedProd.id, original: originalProd, corrected: correctedProd, changes });
              }
            }
          });
          setDetailedCorrections(details);

          toast({ title: "Verificação Concluída", description: result.data.aiOutput.correctionsSummary || "Dados verificados." });
        }
      } catch (error) {
        toast({ title: "Erro Inesperado", description: "Falha ao verificar dados.", variant: "destructive" });
        setScanResult(null);
        setDetailedCorrections([]);
      }
    });
  };

  const handleApplyCorrections = () => {
    if (!scanResult || detailedCorrections.length === 0) {
      toast({ title: "Nenhuma Correção", description: "Nenhuma correção para aplicar.", variant: "default" });
      return;
    }
    startApplyTransition(async () => {
      try {
        const productsToUpdate = detailedCorrections.map(dc => dc.corrected as Product);
        const result = await applyCorrectedDataAction(productsToUpdate);
        if (result.success) {
          toast({ title: "Correções Aplicadas", description: `${result.count} produtos atualizados com sucesso.` });
          setScanResult(null); 
          setDetailedCorrections([]);
        } else {
          toast({ title: "Erro ao Aplicar", description: result.error || "Falha ao aplicar correções.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Erro Inesperado", description: "Falha ao aplicar correções.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl bg-card">
        <CardHeader>
          <CardTitle className="flex items-center font-headline text-2xl">
            <ShieldAlert className="mr-3 h-7 w-7 text-primary" />
            Ferramenta de Integridade de Dados
          </CardTitle>
          <CardDescription>
            Utilize esta ferramenta para escanear e corrigir automaticamente inconsistências nos dados dos produtos com o auxílio de IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleScanData} disabled={isScanning || isApplying} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
            {isScanning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Escanear e Sugerir Correções
          </Button>
        </CardContent>
      </Card>

      {isScanning && (
        <div className="flex flex-col items-center justify-center p-10 border rounded-lg bg-card shadow-md">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Analisando dados dos produtos... Isso pode levar alguns instantes.</p>
        </div>
      )}

      {scanResult && (
        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Diff className="mr-2 h-6 w-6 text-accent" />
              Resultados da Verificação e Sugestões
            </CardTitle>
            <CardDescription>{scanResult.correctionsSummary || "Nenhum sumário de correções fornecido."}</CardDescription>
          </CardHeader>
          <CardContent>
            {detailedCorrections.length > 0 ? (
              <ScrollArea className="h-[500px] border rounded-md p-4 bg-background/30">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Imagem</TableHead>
                      <TableHead>Produto (ID)</TableHead>
                      <TableHead>Alterações Sugeridas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedCorrections.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="relative h-16 w-16 overflow-hidden rounded-md border border-border shadow-sm">
                            <Image
                              src={item.corrected.image || "https://placehold.co/100x100.png"}
                              alt={item.corrected.name || "Imagem"}
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.corrected.name}</div>
                          <div className="text-xs text-muted-foreground">ID: {item.id}</div>
                           <Badge variant="secondary" className="mt-1 mr-1">{item.corrected.category}</Badge>
                           <Badge variant="outline" className="mt-1">{formatCurrency(item.corrected.price)}</Badge>
                        </TableCell>
                        <TableCell>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {item.changes.map((change, idx) => (
                              <li key={idx} className="text-foreground/80">
                                <span className="font-semibold">{change.split(':')[0]}:</span>
                                {change.substring(change.indexOf(':') + 1)}
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="mx-auto h-12 w-12 text-green-500 mb-3" />
                <p className="text-lg">Nenhuma correção necessária!</p>
                <p>Todos os dados dos produtos parecem estar consistentes.</p>
              </div>
            )}
          </CardContent>
          {detailedCorrections.length > 0 && (
            <CardFooter>
              <Button onClick={handleApplyCorrections} disabled={isApplying || isScanning} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isApplying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckSquare className="mr-2 h-4 w-4" />
                )}
                Aplicar Todas as Correções Sugeridas ({detailedCorrections.length})
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
