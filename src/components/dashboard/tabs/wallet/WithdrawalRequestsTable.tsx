
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserSession } from '@/hooks/dashboard/useUserSession';
import { ArrowDownToLine, ExternalLink, FileText } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from './withdrawal-table/EmptyState';
import LoadingState from './withdrawal-table/LoadingState';
import StatusBadge from './withdrawal-table/StatusBadge';
import { formatCurrency, formatDate } from './withdrawal-table/formatUtils';

type WithdrawalRequest = {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_at: string;
  completed_at?: string;
  rejected_at?: string;
  bank_details: {
    bank_name: string;
    account_number: string;
  };
  reference?: string;
  rejection_reason?: string;
};

export default function WithdrawalRequestsTable() {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useUserSession();

  useEffect(() => {
    if (userId) {
      fetchWithdrawalRequests();
      
      // Set up realtime subscription
      const channel = supabase
        .channel('withdrawal-requests-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'withdrawal_requests',
          filter: `user_id=eq.${userId}`
        }, () => {
          fetchWithdrawalRequests();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const fetchWithdrawalRequests = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false });
        
      if (error) throw error;
      
      setWithdrawalRequests(data || []);
    } catch (err) {
      console.error('Error fetching withdrawal requests:', err);
      toast.error('Impossible de charger vos demandes de retrait');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingState />;
  
  if (withdrawalRequests.length === 0) return <EmptyState />;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-lg font-medium text-bgs-blue">Mes demandes de retrait</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Référence</th>
              <th className="px-5 py-3 text-left font-medium">Montant</th>
              <th className="px-5 py-3 text-left font-medium">Date</th>
              <th className="px-5 py-3 text-left font-medium">Banque</th>
              <th className="px-5 py-3 text-left font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {withdrawalRequests.map((request) => {
              const bankDetails = typeof request.bank_details === 'string' 
                ? JSON.parse(request.bank_details) 
                : request.bank_details;
                
              return (
                <tr key={request.id} className="text-gray-700 hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{request.reference || `WD-${request.id.substring(0, 8)}`}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium">{formatCurrency(request.amount)}</td>
                  <td className="px-5 py-4">{formatDate(request.requested_at)}</td>
                  <td className="px-5 py-4">
                    {bankDetails && (
                      <span>
                        {bankDetails.bank_name}
                        <span className="text-xs text-gray-500 block">
                          ...{bankDetails.account_number ? bankDetails.account_number.slice(-4) : '****'}
                        </span>
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={request.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
