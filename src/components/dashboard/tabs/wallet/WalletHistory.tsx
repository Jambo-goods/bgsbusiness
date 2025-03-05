
import React from "react";
import { Separator } from "@/components/ui/separator";
import { History, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'investment' | 'return';
  description: string;
  created_at: string;
  status: string;
}

interface WalletHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export default function WalletHistory({ transactions, isLoading }: WalletHistoryProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'investment':
        return <ArrowUpRight className="h-4 w-4 text-orange-500" />;
      case 'return':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      default:
        return <History className="h-4 w-4 text-bgs-blue" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Dépôt';
      case 'withdrawal':
        return 'Retrait';
      case 'investment':
        return 'Investissement';
      case 'return':
        return 'Rendement';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-bgs-blue" />
          <h2 className="text-lg font-semibold text-bgs-blue">Historique des transactions</h2>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <RefreshCw className="h-8 w-8 text-bgs-blue animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-center py-6 text-bgs-gray-medium">
          Aucune transaction récente à afficher
        </p>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium text-bgs-blue">{getTransactionLabel(transaction.type)}</p>
                  <p className="text-xs text-bgs-gray-medium">
                    {transaction.created_at ? format(new Date(transaction.created_at), 'dd MMM yyyy, HH:mm', { locale: fr }) : '-'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('fr-FR')} €
                </p>
                <p className="text-xs text-bgs-gray-medium">{transaction.description || '-'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
