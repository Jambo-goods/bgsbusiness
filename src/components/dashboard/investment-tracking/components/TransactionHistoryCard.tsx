import React, { useMemo, useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, CheckCircle, Clock, Calendar } from "lucide-react";
import { Transaction, ScheduledPayment } from "../types/investment";
import { calculateReturns } from "@/utils/investmentCalculations";
import { supabase } from "@/integrations/supabase/client";

interface TransactionHistoryCardProps {
  transactions: Transaction[];
  investmentId?: string;
}

export default function TransactionHistoryCard({ transactions, investmentId }: TransactionHistoryCardProps) {
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchScheduledPayments = async () => {
      if (!investmentId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("Fetching scheduled payments for investment ID:", investmentId);
        
        const { data: investment, error: investmentError } = await supabase
          .from('investments')
          .select('project_id, amount, yield_rate')
          .eq('id', investmentId)
          .single();
          
        if (investmentError || !investment) {
          console.error("Error fetching investment:", investmentError);
          setIsLoading(false);
          return;
        }
        
        console.log("Found investment with project_id:", investment.project_id);
        
        const { data: payments, error: paymentsError } = await supabase
          .from('scheduled_payments')
          .select(`
            *,
            projects (
              name,
              image,
              status,
              company_name
            )
          `)
          .eq('project_id', investment.project_id)
          .order('payment_date', { ascending: true });
          
        if (paymentsError) {
          console.error("Error fetching scheduled payments:", paymentsError);
          setIsLoading(false);
          return;
        }
        
        console.log("Scheduled payments fetched:", payments?.length || 0, payments);
        
        if (!payments || payments.length === 0) {
          console.log("No scheduled payments found, creating mock data based on investment");
          const mockScheduledPayments = createMockScheduledPayments(investment);
          setScheduledPayments(mockScheduledPayments);
        } else {
          let cumulativeAmount = 0;
          const paymentsWithCumulative = payments?.map(payment => {
            const calculatedAmount = payment.total_scheduled_amount || 0;
            
            if (payment.status === 'processed') {
              cumulativeAmount += calculatedAmount;
            }
            
            return {
              ...payment,
              calculatedCumulativeAmount: payment.status === 'processed' ? cumulativeAmount : 0
            };
          }) || [];
          
          setScheduledPayments(paymentsWithCumulative);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error in fetchScheduledPayments:", error);
        setIsLoading(false);
      }
    };
    
    fetchScheduledPayments();
  }, [investmentId]);

  const createMockScheduledPayments = (investment: any): ScheduledPayment[] => {
    const mockPayments: ScheduledPayment[] = [];
    const currentDate = new Date();
    const monthlyYield = investment.amount * (fixedYieldPercentage / 100) / 12;
    
    for (let i = 0; i < 12; i++) {
      const paymentDate = new Date(currentDate);
      paymentDate.setMonth(currentDate.getMonth() + i);
      
      mockPayments.push({
        id: `mock-${i}`,
        project_id: investment.project_id,
        payment_date: paymentDate.toISOString(),
        percentage: fixedYieldPercentage / 12,
        status: i === 0 ? 'pending' : 'scheduled',
        total_scheduled_amount: monthlyYield,
        investors_count: 1,
        processed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_invested_amount: investment.amount,
        calculatedCumulativeAmount: 0
      });
    }
    
    return mockPayments;
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
  };
  
  const filteredTransactions = investmentId 
    ? transactions.filter(tx => tx.investment_id === investmentId)
    : transactions;
  
  const totalYieldReceived = useMemo(() => {
    return filteredTransactions
      .filter(tx => tx.type === 'yield' && tx.status === 'completed')
      .reduce((total, tx) => total + tx.amount, 0);
  }, [filteredTransactions]);
  
  const investmentAmount = useMemo(() => {
    const investmentTx = filteredTransactions.find(tx => tx.type === 'investment');
    return investmentTx ? investmentTx.amount : 0;
  }, [filteredTransactions]);
  
  const pendingYields = useMemo(() => {
    return filteredTransactions
      .filter(tx => tx.type === 'yield' && tx.status === 'pending')
      .reduce((total, tx) => total + tx.amount, 0);
  }, [filteredTransactions]);
  
  const tableData = useMemo(() => {
    const sorted = [...filteredTransactions]
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
  }, [filteredTransactions]);
  
  const fixedYieldPercentage = 12;

  const formattedScheduledPayments = useMemo(() => {
    if (!scheduledPayments?.length || !investmentAmount) return [];
    
    let cumulativeScheduledAmount = totalYieldReceived;
    
    const monthlyYield = investmentAmount * (fixedYieldPercentage / 100) / 12;
    
    return scheduledPayments.map(payment => {
      const paymentAmount = payment.total_scheduled_amount || monthlyYield;
      
      if (payment.status !== 'processed') {
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
  }, [scheduledPayments, investmentAmount, fixedYieldPercentage, totalYieldReceived]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-50 p-2.5 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Rendement mensuel</h2>
              <p className="text-xs text-gray-500 mt-0.5">Basées sur vos investissements actuels</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center mb-2">
                <div className="bg-green-100 p-1.5 rounded-full mr-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-xs text-green-700">Total des versements perçus</p>
              </div>
              <p className="text-lg font-medium text-green-700">{totalYieldReceived.toFixed(2)} €</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="flex items-center mb-2">
                <div className="bg-yellow-100 p-1.5 rounded-full mr-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <p className="text-xs text-yellow-700">Total des versements en attente</p>
              </div>
              <p className="text-lg font-medium text-yellow-700">{pendingYields.toFixed(2)} €</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center mb-2">
                <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-xs text-blue-700">Rendement mensuel moyen</p>
              </div>
              <p className="text-lg font-medium text-blue-700">{fixedYieldPercentage}%</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Historique des versements
            </span>
          </h3>
          
          {tableData.length > 0 ? (
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
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              Aucune transaction de rendement trouvée pour cet investissement
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
