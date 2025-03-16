
import React from "react";
import { ArrowUpRight, ArrowDownLeft, CheckCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export interface TransactionItem {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  created_at: string;
  status: string;
  description?: string | null;
  itemType: 'transaction';
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  type: string;
  read: boolean;
  category: string;
  metadata: {
    amount: number;
    status: string;
  } | null;
  itemType: 'notification';
}

export type HistoryItemType = TransactionItem | NotificationItem;

interface HistoryItemProps {
  item: HistoryItemType;
}

export default function HistoryItem({ item }: HistoryItemProps) {
  // Formatting functions
  const formatRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: fr
    });
  };

  const getItemIcon = () => {
    if (item.itemType === 'notification') {
      if (item.category === 'success') {
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      } else if (item.category === 'error') {
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      } else {
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      }
    } else {
      return item.type === 'deposit' 
        ? <ArrowDownLeft className="h-4 w-4 text-green-600" /> 
        : <ArrowUpRight className="h-4 w-4 text-red-600" />;
    }
  };

  const getItemLabel = () => {
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

  const getStatusBadge = () => {
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
    
    if ((item as TransactionItem).status === "pending") {
      return (
        <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full ml-2">
          En attente
        </span>
      );
    }
    return null;
  };

  const getItemAmount = () => {
    if (item.itemType === 'notification') {
      if (item.metadata?.amount) {
        return `-${item.metadata.amount} €`;
      }
      return '';
    }
    
    return item.type === 'deposit' ? `+${item.amount} €` : `-${item.amount} €`;
  };

  const getItemAmountClass = () => {
    if (item.itemType === 'notification') {
      return 'font-semibold text-red-600';
    }
    
    return `font-semibold ${item.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-gray-100">
          {getItemIcon()}
        </div>
        <div>
          <div className="flex items-center">
            <p className="font-medium text-bgs-blue">
              {getItemLabel()}
            </p>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-bgs-gray-medium">
            {formatRelativeTime(item.created_at)}
          </p>
        </div>
      </div>
      <p className={getItemAmountClass()}>
        {getItemAmount()}
      </p>
    </div>
  );
}
