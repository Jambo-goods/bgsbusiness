
import React from "react";
import { Loader2 } from "lucide-react";
import TransactionItem from "./TransactionItem";
import { Transaction } from "./types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

export default function TransactionList({ 
  transactions,
  isLoading, 
  error 
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-8 w-8 text-bgs-blue animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return <p className="text-center py-6 text-red-500">{error}</p>;
  }
  
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
        <p className="text-bgs-gray-medium mb-2">
          Aucune transaction récente à afficher
        </p>
        <p className="text-sm text-gray-500">
          Les transactions apparaîtront ici une fois que vous effectuerez des dépôts ou des retraits.
        </p>
      </div>
    );
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    // Format the date as a string to use as the group key
    const dateKey = transaction.raw_timestamp 
      ? format(new Date(transaction.raw_timestamp), 'dd MMMM yyyy', { locale: fr })
      : format(new Date(transaction.created_at), 'dd MMMM yyyy', { locale: fr });
    
    // Create the group if it doesn't exist
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    // Add the transaction to the group
    groups[dateKey].push(transaction);
    
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
        <div key={date} className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase">{date}</h3>
          <div className="space-y-3">
            {dateTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
