
import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { History, ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";

// Type pour les transactions
interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string | null;
  created_at: string;
  status: string;
}

// Type pour les notifications
interface Notification {
  id: string;
  title: string;
  description: string;
  created_at: string;
  type: string;
  read: boolean;
  category: string;
  metadata: {
    amount: number;
    status: string;
  } | null;
}

interface WalletHistoryProps {
  refreshBalance?: () => Promise<void>;
}

export default function WalletHistory({ refreshBalance }: WalletHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [combinedItems, setCombinedItems] = useState<(Transaction | Notification & { itemType: 'transaction' | 'notification' })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch transactions on component mount and when refreshBalance is called
  useEffect(() => {
    fetchData();
    
    // Setup polling for transactions every 60 seconds
    const pollingInterval = setInterval(() => {
      fetchData(false); // silent refresh (don't show loading state)
    }, 60000);
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, [refreshBalance]);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        setError("Veuillez vous connecter pour voir votre historique");
        return;
      }

      // Récupération des transactions de l'utilisateur connecté
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;
      
      // Récupération des notifications liées aux retraits
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.session.user.id)
        .eq('type', 'withdrawal')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (notificationsError) throw notificationsError;
      
      setTransactions(transactionsData || []);
      setNotifications(notificationsData || []);
      
      // Combiner et trier les transactions et notifications par date
      const combined = [
        ...(transactionsData || []).map(item => ({ ...item, itemType: 'transaction' as const })),
        ...(notificationsData || []).map(item => ({ ...item, itemType: 'notification' as const }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setCombinedItems(combined);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err);
      setError("Erreur lors du chargement de l'historique");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    fetchData(false);
  };

  // Formatting functions
  const formatAmount = (amount: number, type: string) => {
    return type === 'deposit' ? `+${amount} €` : `-${amount} €`;
  };

  const getAmountClass = (type: string) => {
    return type === 'deposit' ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionIcon = (item: any) => {
    if (item.itemType === 'notification') {
      if (item.category === 'success') {
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      } else {
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      }
    } else {
      return item.type === 'deposit' 
        ? <ArrowDownLeft className="h-4 w-4 text-green-600" /> 
        : <ArrowUpRight className="h-4 w-4 text-red-600" />;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: fr
    });
  };

  const getItemLabel = (item: any) => {
    if (item.itemType === 'notification') {
      return item.title;
    }
    
    if (item.description && item.description.includes("Virement bancaire confirmé")) {
      return item.status === "pending" 
        ? "Virement bancaire en attente" 
        : "Virement bancaire reçu";
    }
    
    if (item.description && item.description.includes("Investissement dans")) {
      return "Investissement effectué";
    }
    
    return item.type === 'deposit' ? 'Dépôt' : 'Retrait';
  };

  const getStatusBadge = (item: any) => {
    if (item.itemType === 'notification') {
      if (item.category === 'success') {
        return (
          <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-2">
            Terminé
          </span>
        );
      } else if (item.category === 'info') {
        return (
          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-2">
            En cours
          </span>
        );
      } else if (item.category === 'error') {
        return (
          <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full ml-2">
            Refusé
          </span>
        );
      }
      return null;
    }
    
    if (item.status === "pending") {
      return (
        <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full ml-2">
          En attente
        </span>
      );
    }
    return null;
  };

  const getItemAmount = (item: any) => {
    if (item.itemType === 'notification') {
      return item.metadata?.amount ? `${item.metadata.amount} €` : '';
    }
    
    return formatAmount(item.amount, item.type);
  };

  const getItemAmountClass = (item: any) => {
    if (item.itemType === 'notification') {
      return 'font-semibold text-gray-700';
    }
    
    return `font-semibold ${getAmountClass(item.type)}`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-bgs-blue" />
          <h2 className="text-lg font-semibold text-bgs-blue">Historique des transactions</h2>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>
      
      <Separator className="my-4" />
      
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 text-bgs-blue animate-spin" />
        </div>
      ) : error ? (
        <p className="text-center py-6 text-red-500">{error}</p>
      ) : combinedItems.length === 0 ? (
        <p className="text-center py-6 text-bgs-gray-medium">
          Aucune transaction récente à afficher
        </p>
      ) : (
        <div className="space-y-4">
          {combinedItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gray-100">
                  {getTransactionIcon(item)}
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium text-bgs-blue">
                      {getItemLabel(item)}
                    </p>
                    {getStatusBadge(item)}
                  </div>
                  <p className="text-sm text-bgs-gray-medium">
                    {formatRelativeTime(item.created_at)}
                  </p>
                </div>
              </div>
              <p className={getItemAmountClass(item)}>
                {getItemAmount(item)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
