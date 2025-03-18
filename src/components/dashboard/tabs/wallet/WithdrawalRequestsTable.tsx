import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserSession } from '@/hooks/dashboard/useUserSession';
import { format } from 'date-fns';
import StatusBadge from './withdrawal-table/StatusBadge';
import LoadingState from './withdrawal-table/LoadingState';
import EmptyState from './withdrawal-table/EmptyState';
import { fr } from 'date-fns/locale';

type WithdrawalRequest = {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  bank_name: string;
  account_number: string;
  processed_at: string | null;
  bank_info?: any;
  requested_at?: string;
  notes?: string;
  admin_id?: string;
};

export default function WithdrawalRequestsTable() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useUserSession();
  
  useEffect(() => {
    fetchWithdrawals();
    
    // Set up real-time listener
    const channel = supabase
      .channel('withdrawal_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawal_requests',
        filter: userId ? `user_id=eq.${userId}` : undefined
      }, () => {
        fetchWithdrawals();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  
  const fetchWithdrawals = async () => {
    if (!userId) {
      setWithdrawals([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching withdrawal requests:', error);
        setWithdrawals([]);
      } else if (data) {
        const formattedData: WithdrawalRequest[] = data.map(item => ({
          id: item.id,
          user_id: item.user_id,
          amount: item.amount,
          status: item.status,
          created_at: item.requested_at || new Date().toISOString(),
          bank_name: item.bank_info?.bank_name || "Banque",
          account_number: item.bank_info?.account_number || "0000",
          processed_at: item.processed_at,
          bank_info: item.bank_info,
          requested_at: item.requested_at,
          notes: item.notes,
          admin_id: item.admin_id
        }));
        
        setWithdrawals(formattedData);
      }
    } catch (err) {
      console.error('Error in fetchWithdrawals:', err);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
  };
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (withdrawals.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-bgs-blue">Mes demandes de retrait</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-gray-500">Date</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500">Montant</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500">Compte bancaire</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500">Statut</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500">Date de traitement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {withdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{formatDate(withdrawal.created_at)}</td>
                <td className="px-4 py-3 text-sm font-medium">{withdrawal.amount.toLocaleString('fr-FR')} €</td>
                <td className="px-4 py-3 text-sm">
                  <div className="text-gray-900">{withdrawal.bank_name}</div>
                  <div className="text-gray-500 text-xs">**** {withdrawal.account_number.substring(withdrawal.account_number.length - 4)}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <StatusBadge status={withdrawal.status} />
                </td>
                <td className="px-4 py-3 text-sm">
                  {withdrawal.processed_at ? formatDate(withdrawal.processed_at) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
