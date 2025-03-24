
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function FixReferralCommissions() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runFix = async () => {
    try {
      setIsProcessing(true);
      
      const confirmed = window.confirm(
        "Ceci va analyser tous les paiements de rendement et créer les commissions de parrainage manquantes. " +
        "Cette opération peut prendre un moment et ne doit être exécutée qu'une seule fois. Continuer?"
      );
      
      if (!confirmed) {
        setIsProcessing(false);
        return;
      }
      
      toast.info("Traitement des commissions de parrainage en cours...", {
        duration: 5000,
      });
      
      const { data, error } = await supabase.functions.invoke('fix-referral-commissions', {
        body: {}
      });
      
      if (error) {
        toast.error(`Erreur: ${error.message}`);
        console.error("Error fixing commissions:", error);
        return;
      }
      
      console.log("Fix results:", data);
      setResults(data);
      
      toast.success(`${data.message}`);
    } catch (error) {
      console.error("Error running fix:", error);
      toast.error("Une erreur est survenue lors de la correction des commissions");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Correction des commissions de parrainage</CardTitle>
        <CardDescription>
          Cet outil va vérifier tous les paiements de rendement et créer les commissions de parrainage manquantes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-500 h-5 w-5 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 mb-1">Attention</h4>
                <p className="text-sm text-amber-700">
                  Cette opération va créer des commissions pour tous les paiements de rendement qui n'ont pas encore 
                  généré de commission. Ne lancez cette correction qu'une seule fois.
                </p>
              </div>
            </div>
          </div>
          
          {results && (
            <div className="mt-4 border rounded-md p-4">
              <h4 className="font-medium mb-2">Résultats du traitement</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-3 bg-green-50 rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
                  <span className="text-lg font-bold text-green-600">{results.results.processedCount}</span>
                  <span className="text-xs text-green-700">Commissions créées</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-blue-50 rounded-md">
                  <Clock className="h-5 w-5 text-blue-500 mb-1" />
                  <span className="text-lg font-bold text-blue-600">{results.results.skippedCount}</span>
                  <span className="text-xs text-blue-700">Transactions ignorées</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-red-50 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-red-500 mb-1" />
                  <span className="text-lg font-bold text-red-600">{results.results.failedCount}</span>
                  <span className="text-xs text-red-700">Échecs</span>
                </div>
              </div>
              
              {results.results.details.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">Détails (10 premiers résultats)</h5>
                  <div className="max-h-60 overflow-y-auto border rounded-md">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Transaction</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Statut</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Détails</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {results.results.details.slice(0, 10).map((detail: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-xs">{detail.transactionId.substring(0, 8)}...</td>
                            <td className="px-3 py-2">
                              <Badge 
                                variant={
                                  detail.status === 'success' ? 'default' : 
                                  detail.status === 'skipped' ? 'secondary' : 'destructive'
                                }
                              >
                                {detail.status === 'success' ? 'Succès' : 
                                 detail.status === 'skipped' ? 'Ignoré' : 'Échec'}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-xs">
                              {detail.status === 'success' 
                                ? `Commission: ${detail.commission}€`
                                : detail.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={runFix} 
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            "Corriger les commissions manquantes"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
