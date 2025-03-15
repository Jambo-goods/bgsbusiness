
import React, { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "@/services/notifications";

export default function HistoryTab() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processedTransfers, setProcessedTransfers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTransactions();
    
    const setupSubscriptions = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) return;
      
      const channel = supabase
        .channel('history-tab-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bank_transfers',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log("Bank transfer changed, refreshing history:", payload);
            
            if (payload.new && 
                (payload.new.status === 'received' || payload.new.status === 'reçu') &&
                !processedTransfers.has(payload.new.id)) {
              
              // Mark as processed
              setProcessedTransfers(prev => new Set([...prev, payload.new.id]));
              
              // Show custom notification
              toast.custom((t) => (
                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg shadow-lg border border-blue-200 flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Dépôt réussi</h3>
                    <p>Votre dépôt de {payload.new.amount}€ a été crédité sur votre compte.</p>
                  </div>
                </div>
              ), {
                duration: 6000,
                id: `deposit-success-${payload.new.id}`
              });
              
              // Create notification in database
              notificationService.depositSuccess(payload.new.amount);
            }
            
            fetchTransactions();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'wallet_transactions',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log("Wallet transaction changed, refreshing history:", payload);
            fetchTransactions();
          }
        )
        .subscribe();
        
      return channel;
    };
    
    const subscriptionPromise = setupSubscriptions();
    
    return () => {
      subscriptionPromise.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, [processedTransfers]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      
      const userId = session.session.user.id;
      
      // Fetch both wallet transactions and bank transfers
      const [walletTransactionsResult, bankTransfersResult] = await Promise.all([
        supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
          
        supabase
          .from('bank_transfers')
          .select('*')
          .eq('user_id', userId)
          .in('status', ['received', 'reçu'])
          .order('confirmed_at', { ascending: false })
      ]);
      
      const walletTransactions = walletTransactionsResult.data || [];
      const bankTransfers = bankTransfersResult.data || [];
      
      // Check for bank transfers that need notifications
      bankTransfers.forEach(transfer => {
        if (!processedTransfers.has(transfer.id)) {
          // Mark as processed
          setProcessedTransfers(prev => new Set([...prev, transfer.id]));
          
          // Create notification in database if recent (within past hour)
          const transferTime = transfer.confirmed_at 
            ? new Date(transfer.confirmed_at).getTime() 
            : Date.now();
            
          const oneHourAgo = Date.now() - (60 * 60 * 1000);
          
          if (transferTime > oneHourAgo) {
            console.log("Creating notification for recent transfer:", transfer);
            notificationService.depositSuccess(transfer.amount);
          }
        }
      });
      
      // Format bank transfers to match transaction format
      const formattedBankTransfers = bankTransfers.map(transfer => ({
        id: transfer.id,
        type: 'deposit',
        amount: transfer.amount,
        description: 'Dépôt par virement bancaire',
        status: 'completed',
        created_at: transfer.confirmed_at || transfer.created_at,
        isTransfer: true
      }));
      
      // Combine and sort
      const allTransactions = [...walletTransactions, ...formattedBankTransfers]
        .sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        });
      
      setTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy', { locale: fr });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
            Complété
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600">
            En attente
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
            Échoué
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-bgs-blue mb-4">Historique des transactions</h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-bgs-blue animate-spin mr-2" />
          <span>Chargement de l'historique...</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucune transaction trouvée
        </div>
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
                  <td className="px-4 py-3 text-sm text-bgs-blue">
                    {formatDate(transaction.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-bgs-blue">
                    <div className="flex items-center">
                      {transaction.type === 'deposit' ? (
                        <div className="mr-2 bg-green-100 p-1 rounded-full">
                          <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="mr-2 bg-red-100 p-1 rounded-full">
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                      {transaction.description}
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${
                    transaction.type === 'deposit' 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount} €
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(transaction.status)}
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
