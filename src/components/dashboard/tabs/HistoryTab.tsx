
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, ArrowDownCircle, ArrowUpCircle, PiggyBank, Clock } from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "@/services/notifications";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  status: string;
}

export default function HistoryTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;
        
        if (!userId) {
          console.error("No user ID found");
          setIsLoading(false);
          return;
        }
        
        // Fetch wallet transactions
        const { data: walletTransactions, error: walletError } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (walletError) {
          console.error("Error fetching wallet transactions:", walletError);
        }
        
        // Fetch investments
        const { data: investments, error: investmentsError } = await supabase
          .from('investments')
          .select(`
            *,
            projects (name)
          `)
          .eq('user_id', userId)
          .order('date', { ascending: false });
          
        if (investmentsError) {
          console.error("Error fetching investments:", investmentsError);
        }
        
        // Transform wallet transactions
        const walletItems = (walletTransactions || []).map(tx => {
          // Determine transaction type
          let type = tx.type;
          
          // Check for investments in description
          if (tx.description && tx.description.toLowerCase().includes('investissement')) {
            type = 'investment';
          }
          
          // Check for yield payments
          if (tx.type === 'deposit' && tx.description && tx.description.toLowerCase().includes('rendement')) {
            type = 'yield';
          }
          
          return {
            id: tx.id,
            date: tx.created_at,
            description: tx.description || (type === 'deposit' ? 'Dépôt' : type === 'withdrawal' ? 'Retrait' : type === 'investment' ? 'Investissement' : type === 'yield' ? 'Rendement' : 'Transaction'),
            amount: tx.amount,
            type: type,
            status: tx.status
          };
        });
        
        // Transform investments into transactions (for backward compatibility)
        const investmentItems = (investments || [])
          .filter(inv => {
            // Only include investments that might not already be in wallet transactions
            return !walletItems.some(w => 
              w.type === 'investment' && 
              w.description.includes(inv.projects?.name || '')
            );
          })
          .map(inv => ({
            id: `inv-${inv.id}`,
            date: inv.date,
            description: `Investissement dans ${inv.projects?.name || 'un projet'}`,
            amount: inv.amount,
            type: 'investment',
            status: inv.status
          }));
        
        // Combine and sort by date
        const allTransactions = [...walletItems, ...investmentItems]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setTransactions(allTransactions);
        
        // Setup real-time notifications for new transactions
        const channel = supabase
          .channel('history-tab-changes')
          .on('postgres_changes', 
            {
              event: 'INSERT',
              schema: 'public',
              table: 'wallet_transactions',
              filter: `user_id=eq.${userId}`
            },
            (payload) => {
              console.log('New transaction:', payload);
              
              // Show notification based on transaction type
              if (payload.new) {
                const newTx = payload.new;
                let type = newTx.type;
                
                // Check for investments in description
                if (newTx.description && newTx.description.toLowerCase().includes('investissement')) {
                  type = 'investment';
                  notificationService.investmentConfirmed(newTx.amount, newTx.description.split('dans ')[1] || 'un projet', '');
                } else if (type === 'deposit') {
                  notificationService.depositSuccess(newTx.amount);
                } else if (type === 'withdrawal') {
                  notificationService.withdrawalStatus(newTx.amount, newTx.status || 'pending');
                }
                
                // Add the new transaction to the list
                setTransactions(prev => [
                  {
                    id: newTx.id,
                    date: newTx.created_at,
                    description: newTx.description || (type === 'deposit' ? 'Dépôt' : type === 'withdrawal' ? 'Retrait' : 'Transaction'),
                    amount: newTx.amount,
                    type: type,
                    status: newTx.status
                  },
                  ...prev
                ]);
              }
            }
          )
          .subscribe();
          
        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'yield':
        return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
      case 'investment':
        return <PiggyBank className="h-4 w-4 text-blue-500" />;
      case 'deposit':
        return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-bgs-blue mb-4">Historique des transactions</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 text-bgs-blue animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-center py-8 text-gray-500">Aucune transaction trouvée</p>
      ) : (
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
                  <td className="px-4 py-3 text-sm text-bgs-blue">
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(transaction.type)}
                      {transaction.description}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {transaction.type === 'deposit' || transaction.type === 'yield' ? (
                      <span className="text-green-500">+{transaction.amount} €</span>
                    ) : (
                      <span className="text-red-500">-{transaction.amount} €</span>
                    )}
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'completed' || transaction.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {transaction.status === 'completed' || transaction.status === 'active' ? 'Complété' : 'En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
