
import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { History, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Type pour les transactions
interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string | null;
  created_at: string;
  status: string;
}

export default function WalletHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          setError("Veuillez vous connecter pour voir votre historique");
          setIsLoading(false);
          return;
        }

        // Récupération des transactions de l'utilisateur connecté
        const { data, error } = await supabase
          .from('wallet_transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        
        setTransactions(data as Transaction[]);
      } catch (err) {
        console.error("Erreur lors de la récupération des transactions:", err);
        setError("Erreur lors du chargement de l'historique des transactions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Fonction pour formater le montant avec un signe + ou -
  const formatAmount = (amount: number, type: string) => {
    return type === 'deposit' ? `+${amount} €` : `-${amount} €`;
  };

  // Fonction pour obtenir la classe CSS en fonction du type de transaction
  const getAmountClass = (type: string) => {
    return type === 'deposit' ? 'text-green-600' : 'text-red-600';
  };

  // Fonction pour obtenir l'icône en fonction du type de transaction
  const getTransactionIcon = (type: string) => {
    return type === 'deposit' 
      ? <ArrowDownLeft className="h-4 w-4 text-green-600" /> 
      : <ArrowUpRight className="h-4 w-4 text-red-600" />;
  };

  // Fonction pour formater la date relative
  const formatRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: fr
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-bgs-blue" />
        <h2 className="text-lg font-semibold text-bgs-blue">Historique des transactions</h2>
      </div>
      
      <Separator className="my-4" />
      
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 text-bgs-blue animate-spin" />
        </div>
      ) : error ? (
        <p className="text-center py-6 text-red-500">{error}</p>
      ) : transactions.length === 0 ? (
        <p className="text-center py-6 text-bgs-gray-medium">
          Aucune transaction récente à afficher
        </p>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gray-100">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium text-bgs-blue">
                    {transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                  </p>
                  <p className="text-sm text-bgs-gray-medium">
                    {formatRelativeTime(transaction.created_at)}
                  </p>
                </div>
              </div>
              <p className={`font-semibold ${getAmountClass(transaction.type)}`}>
                {formatAmount(transaction.amount, transaction.type)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
