
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';
import Instructions from './fix-commissions/Instructions';
import TableCheckButtons from './fix-commissions/TableCheckButtons';
import DebugInfo from './fix-commissions/DebugInfo';
import ResultsDisplay from './fix-commissions/ResultsDisplay';

export default function FixReferralCommissions() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [commissionCount, setCommissionCount] = useState<number | null>(null);

  const checkReferralTable = async () => {
    try {
      setDebugInfo(prev => [...prev, "Vérification de la table referral_commissions..."]);
      
      const { data, error } = await supabase
        .from('referral_commissions')
        .select('id, referrer_id, referred_id, source, amount, created_at, status');
      
      if (error) {
        toast.error(`Erreur lors de la vérification de la table: ${error.message}`);
        setDebugInfo(prev => [...prev, `Erreur table: ${error.message}`]);
        return;
      }
      
      const count = data?.length || 0;
      setCommissionCount(count);
      
      if (data) {
        setDebugInfo(prev => [...prev, `${count} commissions trouvées dans la table`]);
        data.forEach((commission, idx) => {
          if (idx < 5) { // Log first 5 for debugging
            setDebugInfo(prev => [...prev, `Commission ${idx+1}: ID=${commission.id}, Référant=${commission.referrer_id}, Filleul=${commission.referred_id}, Montant=${commission.amount}, Status=${commission.status}`]);
          }
        });
      }
      
      toast.info(`${count} commissions trouvées dans la table`);
    } catch (error) {
      console.error("Error checking table:", error);
      toast.error("Erreur lors de la vérification de la table");
      setDebugInfo(prev => [...prev, `Erreur vérification: ${error instanceof Error ? error.message : 'Inconnue'}`]);
    }
  };

  const checkReferralsData = async () => {
    try {
      setDebugInfo(prev => [...prev, "Vérification des parrainages valides..."]);
      
      const { data, error } = await supabase
        .from('referrals')
        .select('id, referrer_id, referred_id, status, commission_rate, total_commission')
        .eq('status', 'valid');
      
      if (error) {
        toast.error(`Erreur lors de la vérification des parrainages: ${error.message}`);
        setDebugInfo(prev => [...prev, `Erreur parrainages: ${error.message}`]);
        return;
      }
      
      const count = data?.length || 0;
      
      if (data) {
        setDebugInfo(prev => [...prev, `${count} parrainages valides trouvés`]);
        data.forEach((referral, idx) => {
          if (idx < 5) { // Log first 5 for debugging
            setDebugInfo(prev => [...prev, `Parrainage ${idx+1}: ID=${referral.id}, Parrain=${referral.referrer_id}, Filleul=${referral.referred_id}, Taux=${referral.commission_rate}%, Total perçu=${referral.total_commission}`]);
          }
        });
      }
      
      // Check for yield transactions for these users
      if (count > 0) {
        const referredUserIds = data.map(r => r.referred_id);
        
        setDebugInfo(prev => [...prev, "Vérification des transactions de rendement pour les filleuls..."]);
        
        const { data: yieldTxs, error: yieldError } = await supabase
          .from('wallet_transactions')
          .select('id, user_id, amount, type, status')
          .eq('type', 'yield')
          .eq('status', 'completed')
          .in('user_id', referredUserIds);
          
        if (yieldError) {
          toast.error(`Erreur lors de la vérification des transactions: ${yieldError.message}`);
          setDebugInfo(prev => [...prev, `Erreur transactions: ${yieldError.message}`]);
          return;
        }
        
        const yieldCount = yieldTxs?.length || 0;
        setDebugInfo(prev => [...prev, `${yieldCount} transactions de rendement trouvées pour des filleuls`]);
        
        yieldTxs?.forEach((tx, idx) => {
          if (idx < 5) { // Log first 5 for debugging
            setDebugInfo(prev => [...prev, `Transaction ${idx+1}: ID=${tx.id}, Utilisateur=${tx.user_id}, Montant=${tx.amount}, Type=${tx.type}, Status=${tx.status}`]);
          }
        });
      }
      
    } catch (error) {
      console.error("Error checking referrals:", error);
      toast.error("Erreur lors de la vérification des parrainages");
      setDebugInfo(prev => [...prev, `Erreur vérification parrainages: ${error instanceof Error ? error.message : 'Inconnue'}`]);
    }
  };

  const runFix = async () => {
    try {
      setIsProcessing(true);
      setDebugInfo([]);
      
      const confirmed = window.confirm(
        "Ceci va analyser tous les paiements de rendement et créer les commissions de parrainage manquantes. " +
        "Cette opération peut prendre un moment. Continuer?"
      );
      
      if (!confirmed) {
        setIsProcessing(false);
        return;
      }
      
      toast.info("Traitement des commissions de parrainage en cours...", {
        duration: 5000,
      });
      
      setDebugInfo(prev => [...prev, "Invoking fix-referral-commissions function"]);
      console.log("Invoking fix-referral-commissions function");
      
      try {
        const { data, error } = await supabase.functions.invoke('fix-referral-commissions', {
          method: 'POST',
        });
        
        if (error) {
          console.error("Error fixing commissions:", error);
          toast.error(`Erreur: ${error.message}`);
          setDebugInfo(prev => [...prev, `Erreur API: ${error.message}`]);
          setIsProcessing(false);
          return;
        }
        
        console.log("Fix results:", data);
        setDebugInfo(prev => [...prev, `Résultats reçus: ${JSON.stringify(data)}`]);
        
        if (!data.success) {
          toast.error(`Erreur serveur: ${data.error || 'Erreur inconnue'}`);
          setDebugInfo(prev => [...prev, `Erreur serveur: ${data.error || 'Erreur inconnue'}`]);
          setIsProcessing(false);
          return;
        }
        
        setResults(data);
        
        if (data.results && data.results.processedCount > 0) {
          toast.success(`${data.message}`);
        } else {
          toast.info(`Aucune commission à traiter. ${data.results?.skippedCount || 0} transaction(s) ignorée(s).`);
        }
      } catch (invokeError) {
        console.error("Error invoking function:", invokeError);
        toast.error("Une erreur est survenue lors de l'appel à la fonction");
        setDebugInfo(prev => [...prev, `Erreur d'invocation: ${invokeError instanceof Error ? invokeError.message : 'Inconnue'}`]);
        setIsProcessing(false);
        return;
      }
      
      // Vérifier de nouveau la table après le traitement
      await checkReferralTable();
    } catch (error) {
      console.error("Error running fix:", error);
      toast.error("Une erreur est survenue lors de la correction des commissions");
      setDebugInfo(prev => [...prev, `Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`]);
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
          <Instructions />
          
          <TableCheckButtons
            isProcessing={isProcessing}
            onCheckTable={checkReferralTable}
            onCheckReferrals={checkReferralsData}
            commissionCount={commissionCount}
          />
          
          <DebugInfo debugInfo={debugInfo} />
          
          {results && <ResultsDisplay results={results.results} />}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <Button 
          onClick={runFix} 
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Corriger les commissions manquantes
            </>
          )}
        </Button>
        <span className="text-xs text-muted-foreground">
          Cette opération corrige uniquement les commissions manquantes et n'affecte pas les commissions existantes.
        </span>
      </CardFooter>
    </Card>
  );
};
