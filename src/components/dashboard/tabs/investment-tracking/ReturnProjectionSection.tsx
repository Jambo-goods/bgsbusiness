
import React, { useMemo, useEffect, useState } from 'react';
import { TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { PaymentRecord } from './types';
import { Project } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReturnProjectionSectionProps {
  paymentRecords: PaymentRecord[];
  cumulativeExpectedReturns: PaymentRecord[];
  isLoading: boolean;
  userInvestments: Project[];
}

const PaymentStatusBadge: React.FC<{
  status: string;
}> = ({
  status
}) => {
  switch (status) {
    case 'pending':
      return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          En attente
        </span>;
    case 'scheduled':
      return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          Programmé
        </span>;
    default:
      return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          {status}
        </span>;
  }
};

const LoadingState: React.FC = () => <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
      <div className="space-y-3">
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  </div>;

const ReturnProjectionSection: React.FC<ReturnProjectionSectionProps> = ({
  paymentRecords,
  cumulativeExpectedReturns,
  isLoading,
  userInvestments
}) => {
  const [localPaymentRecords, setLocalPaymentRecords] = useState<PaymentRecord[]>(paymentRecords);
  const [localExpectedReturns, setLocalExpectedReturns] = useState<PaymentRecord[]>(cumulativeExpectedReturns);
  const [realtimeLoading, setRealtimeLoading] = useState(false);

  useEffect(() => {
    setLocalPaymentRecords(paymentRecords);
    setLocalExpectedReturns(cumulativeExpectedReturns);
    
    const scheduledPaymentsChannel = supabase
      .channel('scheduled_payments_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'scheduled_payments'
      }, async (payload) => {
        console.log('Scheduled payments change detected:', payload);
        setRealtimeLoading(true);
        toast.info("Mise à jour des données de rendement", {
          description: "Synchronisation avec la base de données en cours..."
        });
        
        try {
          if (payload.eventType === 'DELETE') {
            if (payload.old && payload.old.id) {
              setLocalPaymentRecords(current => 
                current.filter(r => r.id !== payload.old.id)
              );
              
              setLocalExpectedReturns(current => 
                current.filter(r => r.id !== payload.old.id)
              );
            }
            setRealtimeLoading(false);
            return;
          }
          
          const recordId = payload.new?.id;
          if (!recordId) {
            setRealtimeLoading(false);
            return;
          }
          
          const { data: updatedPayment, error } = await supabase
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
            .eq('id', recordId)
            .single();
            
          if (error) throw error;
          
          if (updatedPayment) {
            const updatedRecord: PaymentRecord = {
              id: updatedPayment.id,
              projectId: updatedPayment.project_id,
              projectName: updatedPayment.projects?.name || 'Projet inconnu',
              amount: updatedPayment.total_scheduled_amount || 0,
              date: new Date(updatedPayment.payment_date),
              type: 'yield',
              status: updatedPayment.status as 'paid' | 'pending' | 'scheduled',
              percentage: updatedPayment.percentage
            };
            
            setLocalPaymentRecords(current => {
              const updatedRecords = [...current];
              const index = updatedRecords.findIndex(r => r.id === updatedPayment.id);
              
              if (index >= 0) {
                updatedRecords[index] = updatedRecord;
              } else {
                updatedRecords.push(updatedRecord);
              }
              
              return updatedRecords;
            });
            
            setLocalExpectedReturns(current => {
              const updatedReturns = [...current];
              const index = updatedReturns.findIndex(r => r.id === updatedPayment.id);
              
              if (index >= 0) {
                updatedReturns[index] = {
                  ...updatedRecord,
                  expectedCumulativeReturn: updatedReturns[index].expectedCumulativeReturn
                };
              } else {
                const totalBefore = updatedReturns.reduce((sum, record) => {
                  return record.date < updatedRecord.date ? sum + record.amount : sum;
                }, 0);
                updatedReturns.push({
                  ...updatedRecord,
                  expectedCumulativeReturn: totalBefore + updatedRecord.amount
                });
              }
              
              return updatedReturns.sort((a, b) => a.date.getTime() - b.date.getTime());
            });
          }
        } catch (error) {
          console.error('Error handling scheduled payment update:', error);
        } finally {
          setRealtimeLoading(false);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(scheduledPaymentsChannel);
    };
  }, [paymentRecords, cumulativeExpectedReturns]);

  const futurePayments = useMemo(() => {
    const payments = localExpectedReturns.filter(payment => payment.status === 'scheduled' || payment.status === 'pending').map(payment => {
      const originalDate = new Date(payment.date);
      const adjustedDate = new Date(originalDate.getFullYear(), originalDate.getMonth(), 5);

      if (originalDate.getDate() > 5 && payment.status === 'scheduled') {
        adjustedDate.setMonth(adjustedDate.getMonth() + 1);
      }
      return {
        ...payment,
        date: adjustedDate
      };
    });

    return payments.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [localExpectedReturns]);

  const stats = useMemo(() => {
    const totalReceived = localPaymentRecords.filter(payment => payment.status === 'paid').reduce((sum, payment) => sum + payment.amount, 0);
    const totalPending = localPaymentRecords.filter(payment => payment.status === 'pending' || payment.status === 'scheduled').reduce((sum, payment) => sum + payment.amount, 0);
    const paidPayments = localPaymentRecords.filter(payment => payment.status === 'paid');
    const averageMonthlyReturn = paidPayments.length > 0 ? totalReceived / paidPayments.length : 0;
    const averageReturnPercentage = 12;

    return {
      totalReceived,
      totalPending,
      averageMonthlyReturn,
      averageReturnPercentage
    };
  }, [localPaymentRecords]);

  if (isLoading || realtimeLoading) {
    return <LoadingState />;
  }

  const fixedPercentage = 12;
  
  // Format date to match the scheduled_payments format
  const formatDate = (date: Date) => {
    // Format the date to be displayed as "5 janvier 2024" instead of MM/DD/YYYY
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-50 p-2.5 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Rendement mensuel</h2>
            <p className="text-xs text-gray-500 mt-0.5">Basées sur vos investissements actuels</p>
          </div>
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
          <p className="text-lg font-medium text-green-700">{stats.totalReceived.toFixed(2)} €</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center mb-2">
            <div className="bg-yellow-100 p-1.5 rounded-full mr-2">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-xs text-yellow-700">Total des versements en attente</p>
          </div>
          <p className="text-lg font-medium text-yellow-700">{stats.totalPending.toFixed(2)} €</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 p-1.5 rounded-full mr-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs text-blue-700">Rendement mensuel moyen</p>
          </div>
          <p className="text-lg font-medium text-blue-700">{stats.averageReturnPercentage}%</p>
        </div>
      </div>

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
            {futurePayments && futurePayments.length > 0 ? futurePayments.map(payment => <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(payment.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                    {payment.projectName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {fixedPercentage}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.amount.toFixed(2)} €
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                    {payment.expectedCumulativeReturn ? payment.expectedCumulativeReturn.toFixed(2) : 0} €
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PaymentStatusBadge status={payment.status} />
                  </td>
                </tr>) : <tr>
                <td colSpan={6} className="px-4 py-4 text-sm text-center text-gray-500">
                  Aucune projection de rendement disponible
                </td>
              </tr>}
          </tbody>
        </table>
      </div>

      {userInvestments && userInvestments.length > 0 && <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            <strong>Note:</strong> Ces projections sont basées sur les taux de rendement actuels et peuvent varier. 
            Le premier versement est généralement effectué après la période de délai initiale spécifiée dans chaque projet. 
            Les versements suivants sont effectués le 5 de chaque mois.
          </p>
        </div>}
    </div>
  );
};

export default ReturnProjectionSection;
