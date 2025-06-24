
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Sparkles, CheckSquare, Diff, AlertTriangle } from 'lucide-react';
import type { Product } from '@/types';
import { CorrectProductDataOutput } from '@/ai/flows/product-data-integrity';
import { useToast } from '@/hooks/use-toast';

interface CorrectionDetail {
  id: string;
  original: Product;
  corrected: Product; 
  changes: string[];
}

export default function DataIntegrityPage() {
  const [scanResult, setScanResult] = useState<CorrectProductDataOutput | null>(null);
  const [detailedCorrections, setDetailedCorrections] = useState<CorrectionDetail[]>([]);
  const { toast } = useToast();

  const handleScanData = () => {
      toast({
        title: "Recurso Indisponível",
        description: "A verificação de integridade de dados por IA está temporariamente desativada.",
        variant: "destructive",
      });
  };

  const handleApplyCorrections = () => {
       toast({
        title: "Recurso Indisponível",
        description: "A verificação de integridade de dados por IA está temporariamente desativada.",
        variant: "destructive",
      });
  };

  const isFeatureDisabled = true;

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
          {isFeatureDisabled && (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Recurso Temporariamente Indisponível</AlertTitle>
                <AlertDescription>
                  Esta funcionalidade de verificação por IA está desativada no momento para resolver problemas de dependência do projeto.
                </AlertDescription>
              </Alert>
          )}
          <Button onClick={handleScanData} disabled={isFeatureDisabled} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground mt-4">
              <Sparkles className="mr-2 h-4 w-4" />
              Escanear e Sugerir Correções
          </Button>
        </CardContent>
      </Card>

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
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="mx-auto h-12 w-12 text-green-500 mb-3" />
                <p className="text-lg">Nenhuma correção necessária!</p>
                <p>Todos os dados dos produtos parecem estar consistentes.</p>
              </div>
          </CardContent>
          {detailedCorrections.length > 0 && (
            <CardFooter>
              <Button onClick={handleApplyCorrections} disabled={isFeatureDisabled} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                  <CheckSquare className="mr-2 h-4 w-4" />
                Aplicar Todas as Correções Sugeridas ({detailedCorrections.length})
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
