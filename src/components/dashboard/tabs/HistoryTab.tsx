
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Wallet } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  status: string;
  type: string;
}

export default function HistoryTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setIsLoading(true);
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session?.user) {
          return;
        }
        
        const userId = session.session.user.id;
        
        // Fetch bank transfers
        const { data: bankTransfers, error: bankTransfersError } = await supabase
          .from('bank_transfers')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (bankTransfersError) {
          console.error("Error fetching bank transfers:", bankTransfersError);
        }
        
        // Fetch wallet transactions
        const { data: walletTransactions, error: walletTransactionsError } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (walletTransactionsError) {
          console.error("Error fetching wallet transactions:", walletTransactionsError);
        }
        
        // Process and combine transactions
        const combinedTransactions: Transaction[] = [];
        
        // Process bank transfers
        if (bankTransfers) {
          bankTransfers.forEach(transfer => {
            combinedTransactions.push({
              id: transfer.id,
              date: new Date(transfer.created_at),
              description: `Virement bancaire (${transfer.reference || 'Sans référence'})`,
              amount: transfer.amount || 0,
              status: transfer.status,
              type: 'deposit'
            });
          });
        }
        
        // Process wallet transactions
        if (walletTransactions) {
          walletTransactions.forEach(transaction => {
            if (transaction.id && !combinedTransactions.find(t => t.id === transaction.id)) {
              combinedTransactions.push({
                id: transaction.id,
                date: new Date(transaction.created_at),
                description: transaction.description || `Transaction portefeuille (${transaction.type})`,
                amount: transaction.type === 'withdrawal' ? -transaction.amount : transaction.amount,
                status: transaction.status,
                type: transaction.type
              });
            }
          });
        }
        
        // Sort by date, newest first
        combinedTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        setTransactions(combinedTransactions);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTransactions();
    
    // Set up real-time subscription for transactions
    const setupSubscription = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;
      
      const userId = session.session.user.id;
      
      const channel = supabase
        .channel('transaction-history-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'bank_transfers',
          filter: `user_id=eq.${userId}`
        }, () => {
          console.log("Bank transfer updated, refreshing history");
          fetchTransactions();
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `user_id=eq.${userId}`
        }, () => {
          console.log("Wallet transaction updated, refreshing history");
          fetchTransactions();
        })
        .subscribe();
        
      return channel;
    };
    
    const subscription = setupSubscription();
    
    return () => {
      subscription.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'completed' || status === 'reçu' || status === 'received') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
          Complété
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600">
          En attente
        </span>
      );
    } else if (status === 'rejected' || status === 'failed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
          Rejeté
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        {status}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: fr });
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bgs-blue"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-bgs-blue mb-4">Historique des transactions</h2>
        <div className="p-8 text-center text-gray-500">
          <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium">Aucune transaction trouvée</p>
          <p className="mt-1">Vos transactions apparaîtront ici une fois que vous aurez effectué des dépôts ou des retraits.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-bgs-blue mb-4">Historique des transactions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Montant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-bgs-gray-light/50">
                <td className="px-4 py-3 text-sm text-bgs-blue">{formatDate(transaction.date)}</td>
                <td className="px-4 py-3 text-sm text-bgs-blue">{transaction.description}</td>
                <td className={`px-4 py-3 text-sm font-medium ${transaction.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {transaction.amount >= 0 ? '+' : ''}{transaction.amount} €
                </td>
                <td>{getStatusBadge(transaction.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
