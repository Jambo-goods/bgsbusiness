
import React, { useMemo, useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, CheckCircle, Clock, Calendar } from "lucide-react";
import { Transaction, ScheduledPayment } from "../types/investment";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useScheduledPayments from "@/hooks/useScheduledPayments";
import { processPaymentToWallet } from "@/utils/investmentCalculations";

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
  
  console.log("Tous les paiements programmés:", scheduledPayments);
  
  const [projectId, setProjectId] = useState<string | null>(null);
  const [investmentDate, setInvestmentDate] = useState<Date | null>(null);
  const [firstPaymentDelayMonths, setFirstPaymentDelayMonths] = useState<number>(1);
  const [firstValidPaymentDate, setFirstValidPaymentDate] = useState<Date | null>(null);
  const [actualInvestmentAmount, setActualInvestmentAmount] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    // Get the user's ID for payment processing
    const getUserId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
      }
    };
    
    getUserId();
  }, []);
  
  useEffect(() => {
    const fetchInvestmentDetails = async () => {
      if (!investmentId) return;
      
      try {
        const { data, error } = await supabase
          .from('investments')
          .select(`
            project_id,
            date,
            amount,
            projects(first_payment_delay_months, name)
          `)
          .eq('id', investmentId)
          .single();
          
        if (error) throw error;
        if (data) {
          console.log("Investment details found:", data);
          setProjectId(data.project_id);
          
          // Store the actual investment amount
          setActualInvestmentAmount(data.amount || 0);
          
          if (data.date) {
            const investDate = new Date(data.date);
            setInvestmentDate(investDate);
            
            const delayMonths = data.projects?.first_payment_delay_months || 1;
            setFirstPaymentDelayMonths(delayMonths);
            
            const validDate = new Date(investDate);
            validDate.setMonth(validDate.getMonth() + delayMonths);
            setFirstValidPaymentDate(validDate);
            
            console.log("First valid payment date calculated:", validDate);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'investissement:", error);
      }
    };
    
    fetchInvestmentDetails();
  }, [investmentId]);
  
  const investmentScheduledPayments = useMemo(() => {
    if (!projectId || !scheduledPayments?.length) {
      console.log("Pas de projectId ou pas de paiements programmés");
      return [];
    }
    
    console.log(`Filtrage des paiements programmés pour le projet ${projectId}`);
    
    const filteredPayments = scheduledPayments.filter(payment => payment.project_id === projectId);
    console.log("Paiements programmés filtrés:", filteredPayments);
    
    return filteredPayments;
  }, [scheduledPayments, projectId]);
  
  // Le rendement mensuel est de 12%
  const fixedYieldPercentage = 12;

  const formattedScheduledPayments = useMemo(() => {
    if (!investmentScheduledPayments?.length || !investmentDate || !firstValidPaymentDate) {
      console.log("Pas de paiements programmés ou pas de date d'investissement");
      return [];
    }
    
    // Utiliser le montant d'investissement réel de la base de données
    const actualAmount = actualInvestmentAmount > 0 ? actualInvestmentAmount : 200;
    console.log("Montant d'investissement réel utilisé:", actualAmount);
    
    let cumulativeScheduledAmount = totalYieldReceived;
    
    // Calculer le rendement mensuel: 12% du montant d'investissement
    const monthlyYield = (actualAmount * fixedYieldPercentage) / 100;
    
    console.log("Rendement mensuel calculé:", monthlyYield, "pour un investissement de", actualAmount);
    
    const sortedPayments = [...investmentScheduledPayments].sort(
      (a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
    );
    
    const validPayments = sortedPayments.filter(payment => {
      const paymentDate = new Date(payment.payment_date);
      return paymentDate >= firstValidPaymentDate;
    });
    
    console.log("Paiements valides après le délai du premier versement:", validPayments.length);
    
    return validPayments.map(payment => {
      // Calculer le montant basé sur le pourcentage mensuel direct (12%)
      const paymentPercentage = payment.percentage || fixedYieldPercentage;
      const paymentAmount = (actualAmount * paymentPercentage) / 100;
      
      console.log(`Paiement programmé: ${payment.id}, montant: ${paymentAmount}, date: ${payment.payment_date}, pourcentage: ${paymentPercentage}%`);
      
      cumulativeScheduledAmount += paymentAmount;
      
      return {
        id: payment.id,
        date: payment.payment_date,
        amount: paymentAmount,
        cumulativeAmount: cumulativeScheduledAmount,
        percentage: payment.percentage || fixedYieldPercentage,
        status: payment.status,
        projectName: payment.projects?.name || 'Projet inconnu'
      };
    });
  }, [investmentScheduledPayments, actualInvestmentAmount, fixedYieldPercentage, totalYieldReceived, investmentDate, firstValidPaymentDate]);

  console.log("Paiements programmés formatés:", formattedScheduledPayments);

  // Calculate the total cumulative amount from all transactions (paid) and scheduled payments
  const totalCumulativeAmount = useMemo(() => {
    const paidTransactionsTotal = tableData.length > 0 
      ? tableData[tableData.length - 1].cumulativeAmount 
      : 0;
      
    const scheduledPaymentsTotal = formattedScheduledPayments.length > 0 
      ? formattedScheduledPayments[formattedScheduledPayments.length - 1].cumulativeAmount 
      : 0;
      
    // Return the largest of the two (they should be the same if there is overlap)
    return Math.max(paidTransactionsTotal, scheduledPaymentsTotal);
  }, [tableData, formattedScheduledPayments]);

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Set up a real-time listener for scheduled payments status changes
  useEffect(() => {
    if (!projectId || !userId) return;

    console.log(`Setting up real-time listener for scheduled payments on project ${projectId}`);

    // Listen for scheduled payment status changes
    const channel = supabase.channel('scheduled-payments-status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'scheduled_payments',
        filter: `project_id=eq.${projectId}`
      }, async (payload) => {
        console.log('Scheduled payment status changed:', payload);
        
        // When a payment is changed to 'paid', add its amount to the wallet balance
        if (payload.new && payload.old && 
            payload.old.status !== 'paid' && 
            payload.new.status === 'paid') {
              
          const changedPayment = formattedScheduledPayments.find(
            p => p.id === payload.new.id
          );
          
          if (changedPayment) {
            console.log(`Processing payment ${changedPayment.id} for ${changedPayment.amount}€`);
            
            const success = await processPaymentToWallet(
              userId, 
              changedPayment.amount, 
              changedPayment.id, 
              changedPayment.projectName
            );
            
            if (success) {
              toast.success(`${changedPayment.amount.toFixed(2)}€ ont été crédités sur votre solde disponible`);
            }
          }
        }
      })
      .subscribe((status) => {
        console.log(`Subscription status for scheduled payments: ${status}`);
      });
      
    return () => {
      console.log("Cleaning up scheduled payments listener");
      supabase.removeChannel(channel);
    };
  }, [projectId, userId, formattedScheduledPayments]);

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
          
          {/* Cumulative Summary Box */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-blue-800 font-semibold">Cumul total des versements</h4>
                <p className="text-sm text-blue-600">Montant total reçu et programmé</p>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {totalCumulativeAmount.toFixed(2)} €
              </div>
            </div>
          </div>
          
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
                  {tableData.map((tx, index) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                        {investmentId ? "Investissement actuel" : `Projet #${index + 1}`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {fixedYieldPercentage}%
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
              {investmentDate && firstValidPaymentDate ? 
                `Aucun paiement prévu avant le ${formatDate(firstValidPaymentDate.toISOString())} (délai initial de ${firstPaymentDelayMonths} mois)` : 
                "Chargement des informations de l'investissement..."}
            </div>
          )}
        </div>

        {actualInvestmentAmount > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> Ces projections sont basées sur un taux de rendement mensuel de {fixedYieldPercentage}%. 
              Le premier versement est généralement effectué après la période de délai initiale spécifiée dans chaque projet.
              Pour un investissement de {actualInvestmentAmount}€, le rendement mensuel est de {((actualInvestmentAmount * fixedYieldPercentage) / 100).toFixed(2)}€.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
