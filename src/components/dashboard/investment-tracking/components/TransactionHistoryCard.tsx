
import React, { useMemo, useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, CheckCircle, Clock, Calendar } from "lucide-react";
import { Transaction, ScheduledPayment } from "../types/investment";
import { calculateReturns } from "@/utils/investmentCalculations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useScheduledPayments from "@/hooks/useScheduledPayments";

interface TransactionHistoryCardProps {
  transactions: Transaction[];
  investmentId?: string;
}

export default function TransactionHistoryCard({ transactions, investmentId }: TransactionHistoryCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { scheduledPayments, isLoading: isLoadingScheduledPayments } = useScheduledPayments();
  
  const investmentTransactions = useMemo(() => {
    return investmentId 
      ? transactions.filter(tx => tx.investment_id === investmentId)
      : transactions;
  }, [transactions, investmentId]);
  
  // Debugger pour voir les transactions investmentId
  console.log("Investment ID:", investmentId);
  console.log("Toutes les transactions:", transactions);
  console.log("Transactions filtrées par investmentId:", investmentTransactions);
  
  const totalYieldReceived = useMemo(() => {
    return investmentTransactions
      .filter(tx => tx.type === 'yield' && tx.status === 'completed')
      .reduce((total, tx) => total + tx.amount, 0);
  }, [investmentTransactions]);
  
  const investmentAmount = useMemo(() => {
    const investmentTx = investmentTransactions.find(tx => tx.type === 'investment');
    return investmentTx ? investmentTx.amount : 0;
  }, [investmentTransactions]);
  
  const pendingYields = useMemo(() => {
    return investmentTransactions
      .filter(tx => tx.type === 'yield' && tx.status === 'pending')
      .reduce((total, tx) => total + tx.amount, 0);
  }, [investmentTransactions]);
  
  const tableData = useMemo(() => {
    const sorted = [...investmentTransactions]
      .filter(tx => tx.type === 'yield')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    let cumulativeAmount = 0;
    return sorted.map(tx => {
      cumulativeAmount += tx.amount;
      return {
        ...tx,
        cumulativeAmount
      };
    });
  }, [investmentTransactions]);
  
  // Debugger pour voir les paiements programmés
  console.log("Tous les paiements programmés:", scheduledPayments);
  
  // Obtenir le project_id lié à cet investissement
  const [projectId, setProjectId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProjectId = async () => {
      if (!investmentId) return;
      
      try {
        const { data, error } = await supabase
          .from('investments')
          .select('project_id')
          .eq('id', investmentId)
          .single();
          
        if (error) throw error;
        if (data) {
          console.log("Project ID trouvé depuis l'investissement:", data.project_id);
          setProjectId(data.project_id);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du project_id:", error);
      }
    };
    
    fetchProjectId();
  }, [investmentId]);
  
  // Filtrer les paiements programmés pour cet investissement spécifique
  const investmentScheduledPayments = useMemo(() => {
    if (!projectId || !scheduledPayments?.length) {
      console.log("Pas de projectId ou pas de paiements programmés");
      return [];
    }
    
    console.log(`Filtrage des paiements programmés pour le projet ${projectId}`);
    
    // Filtrer les paiements programmés pour ce projet
    const filteredPayments = scheduledPayments.filter(payment => payment.project_id === projectId);
    console.log("Paiements programmés filtrés:", filteredPayments);
    
    return filteredPayments;
  }, [scheduledPayments, projectId]);
  
  const fixedYieldPercentage = 12;

  const formattedScheduledPayments = useMemo(() => {
    if (!investmentScheduledPayments?.length || !investmentAmount) {
      console.log("Pas de paiements programmés ou montant d'investissement nul");
      return [];
    }
    
    let cumulativeScheduledAmount = totalYieldReceived;
    
    const monthlyYield = investmentAmount * (fixedYieldPercentage / 100) / 12;
    console.log("Rendement mensuel calculé:", monthlyYield);
    
    // Tri par date de paiement
    const sortedPayments = [...investmentScheduledPayments].sort(
      (a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
    );
    
    return sortedPayments.map(payment => {
      // Calculer le montant du paiement basé sur le pourcentage et le montant investi
      let paymentAmount;
      
      if (payment.total_scheduled_amount && payment.total_invested_amount && payment.total_invested_amount > 0) {
        // Si nous avons les montants totaux, calculer proportionnellement
        paymentAmount = (investmentAmount / payment.total_invested_amount) * payment.total_scheduled_amount;
        console.log(`Calcul proportionnel: ${investmentAmount} / ${payment.total_invested_amount} * ${payment.total_scheduled_amount} = ${paymentAmount}`);
      } else {
        // Sinon utiliser le calcul du rendement mensuel fixe
        paymentAmount = monthlyYield;
        console.log("Utilisation du rendement mensuel fixe:", paymentAmount);
      }
      
      if (payment.status !== 'paid') {
        cumulativeScheduledAmount += paymentAmount;
      }
      
      return {
        id: payment.id,
        date: payment.payment_date,
        amount: paymentAmount,
        cumulativeAmount: cumulativeScheduledAmount,
        percentage: payment.percentage || (fixedYieldPercentage / 12),
        status: payment.status,
        projectName: payment.projects?.name || 'Projet inconnu'
      };
    });
  }, [investmentScheduledPayments, investmentAmount, fixedYieldPercentage, totalYieldReceived]);

  console.log("Paiements programmés formatés:", formattedScheduledPayments);

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
  };

  // Effet pour simuler le chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Historique des versements
            </span>
          </h3>
          
          {isLoading || isLoadingScheduledPayments ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bgs-blue"></div>
            </div>
          ) : tableData.length > 0 || formattedScheduledPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pourcentage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumul</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Afficher d'abord les transactions passées réelles */}
                  {tableData.map((tx, index) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                        {investmentId ? "Investissement actuel" : `Projet #${index + 1}`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {fixedYieldPercentage / 12}%
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tx.amount.toFixed(2)} €
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                        {tx.cumulativeAmount.toFixed(2)} €
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {tx.status === 'completed' ? '✓ Confirmé' : 'Programmé'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Ensuite afficher les paiements futurs programmés */}
                  {formattedScheduledPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                        {payment.projectName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {payment.percentage.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.amount.toFixed(2)} €
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                        {payment.cumulativeAmount.toFixed(2)} €
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'paid' ? 'bg-green-100 text-green-800' : 
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {payment.status === 'paid' ? '✓ Payé' : 
                           payment.status === 'pending' ? '⏳ En attente' : 
                           '📅 Programmé'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              {scheduledPayments?.length > 0 ? 
                "Aucun paiement programmé trouvé pour cet investissement" : 
                "Chargement des paiements programmés..."}
            </div>
          )}
        </div>

        {/* Nouvelle section spécifique pour les paiements programmés */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Calendrier des paiements programmés
            </span>
          </h3>
          
          {isLoading || isLoadingScheduledPayments ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bgs-blue"></div>
            </div>
          ) : formattedScheduledPayments.length > 0 ? (
            <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-1 divide-y divide-gray-100">
                {formattedScheduledPayments.map((payment) => (
                  <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          payment.status === 'paid' ? 'bg-green-100' : 
                          payment.status === 'pending' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          {payment.status === 'paid' ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : payment.status === 'pending' ? (
                            <Clock className="h-6 w-6 text-yellow-600" />
                          ) : (
                            <Calendar className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{formatDate(payment.date)}</p>
                          <p className="text-sm text-gray-500">{payment.projectName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{payment.amount.toFixed(2)} €</p>
                        <p className="text-sm text-blue-600">{payment.percentage.toFixed(2)}% de rendement</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {payment.status === 'paid' ? '✓ Payé' : 
                         payment.status === 'pending' ? '⏳ En attente' : 
                         '📅 Programmé'}
                      </span>
                      <span className="text-sm text-gray-500">
                        Cumul: {payment.cumulativeAmount.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              {projectId ? 
                "Aucun paiement programmé n'est prévu pour cet investissement actuellement" : 
                "Chargement des informations de l'investissement..."}
            </div>
          )}
        </div>
        
        {investmentAmount > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> Ces projections sont basées sur les taux de rendement actuels et peuvent varier. 
              Le premier versement est généralement effectué après la période de délai initiale spécifiée dans chaque projet. 
              Les versements suivants sont effectués le 5 de chaque mois.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
