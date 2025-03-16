
import React from "react";
import { Loader2 } from "lucide-react";
import TransactionItem from "./TransactionItem";
import { Transaction } from "./types";

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
  
  if (transactions.length === 0) {
    return (
      <p className="text-center py-6 text-bgs-gray-medium">
        Aucune transaction récente à afficher
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
}
