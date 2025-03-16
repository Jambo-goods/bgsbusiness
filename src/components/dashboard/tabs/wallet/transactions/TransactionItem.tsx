
import React from "react";
import { ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react";
import { Transaction } from "./types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const formatAmount = (amount: number, type: string) => {
    return type === 'deposit' ? `+${amount} €` : `-${amount} €`;
  };

  const getAmountClass = (type: string) => {
    return type === 'deposit' ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionIcon = (type: string, description?: string | null) => {
    if (description && description.includes("Investissement dans")) {
      return <TrendingUp className="h-4 w-4 text-blue-600" />;
    }
    
    return type === 'deposit' 
      ? <ArrowDownLeft className="h-4 w-4 text-green-600" /> 
      : <ArrowUpRight className="h-4 w-4 text-red-600" />;
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy à HH:mm', { locale: fr });
    } catch (error) {
      console.error("Erreur de formatage de date:", error, "pour la date:", dateString);
      return "Date inconnue";
    }
  };

  const getTransactionLabel = (transaction: Transaction) => {
    if (transaction.description && transaction.description.includes("Investissement dans")) {
      return "Investissement effectué";
    }
    
    if (transaction.description && transaction.description.includes("Virement bancaire reçu")) {
      return "Virement bancaire reçu";
    }
    
    if (transaction.description && transaction.description.includes("Virement bancaire confirmé")) {
      return transaction.status === "pending" 
        ? "Virement bancaire en attente" 
        : "Virement bancaire reçu";
    }

    if (transaction.description && transaction.description.includes("Demande de retrait")) {
      return transaction.status === "pending"
        ? "Demande de retrait en attente"
        : transaction.status === "completed" || transaction.status === "approved"
          ? "Retrait effectué"
          : transaction.status === "rejected"
            ? "Retrait rejeté"
            : "Demande de retrait";
    }
    
    if (transaction.description && transaction.description.includes("Retrait confirmé")) {
      return "Retrait confirmé";
    }
    
    if (transaction.description && transaction.description.includes("Retrait rejeté")) {
      return "Retrait rejeté";
    }
    
    return transaction.type === 'deposit' ? 'Dépôt' : 'Retrait';
  };
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-gray-100">
          {getTransactionIcon(transaction.type, transaction.description)}
        </div>
        <div>
          <div className="flex items-center">
            <p className="font-medium text-bgs-blue">
              {getTransactionLabel(transaction)}
            </p>
            {transaction.status === "pending" && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                En attente
              </span>
            )}
            {transaction.status === "rejected" && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Rejeté
              </span>
            )}
            {transaction.status === "approved" && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Approuvé
              </span>
            )}
          </div>
          <p className="text-sm text-bgs-gray-medium">
            {formatRelativeTime(transaction.raw_timestamp || transaction.created_at)}
          </p>
          {transaction.description && (
            <p className="text-sm text-bgs-gray-medium">{transaction.description}</p>
          )}
        </div>
      </div>
      <p className={`font-semibold ${getAmountClass(transaction.type)}`}>
        {formatAmount(transaction.amount, transaction.type)}
      </p>
    </div>
  );
}
