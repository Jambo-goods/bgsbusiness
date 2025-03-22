
import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, TrendingDown, Bell, CreditCard, Sparkles, ArrowUpRight } from "lucide-react";

// Types d'éléments qui peuvent apparaître dans l'historique
export type TransactionItem = {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  created_at: string;
  type: "deposit" | "withdrawal" | "investment";
  status: string;
  itemType: "transaction";
};

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  type: string;
  read: boolean;
  category: string;
  metadata: Record<string, any>;
  itemType: "notification";
};

export type HistoryItemType = TransactionItem | NotificationItem;

interface HistoryItemProps {
  item: HistoryItemType;
}

function formatDate(date: string) {
  return format(new Date(date), "dd MMM yyyy", { locale: fr });
}

export default function HistoryItem({ item }: HistoryItemProps) {
  if (item.itemType === "transaction") {
    return <TransactionHistoryItem transaction={item} />;
  } else {
    return <NotificationHistoryItem notification={item} />;
  }
}

function TransactionHistoryItem({ transaction }: { transaction: TransactionItem }) {
  const formatAmount = (amount: number, type: string) => {
    if (type === "deposit") {
      return `+${amount.toFixed(2)} €`;
    } else if (type === "withdrawal") {
      return `-${amount.toFixed(2)} €`;
    } else if (type === "investment") {
      return `-${amount.toFixed(2)} €`;
    } else {
      return `${amount.toFixed(2)} €`;
    }
  };

  const statusStyles = {
    completed: "bg-green-100 text-green-600",
    pending: "bg-blue-100 text-blue-600",
    failed: "bg-red-100 text-red-600",
    default: "bg-gray-100 text-gray-600",
  };

  const getStatusStyle = (status: string) => {
    if (status === "completed") return statusStyles.completed;
    if (status === "pending") return statusStyles.pending;
    if (status === "failed") return statusStyles.failed;
    return statusStyles.default;
  };

  const getIcon = (type: string) => {
    if (type === "deposit") return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (type === "withdrawal") return <TrendingDown className="w-4 h-4 text-red-500" />;
    if (type === "investment") return <ArrowUpRight className="w-4 h-4 text-amber-500" />;
    return <CreditCard className="w-4 h-4 text-gray-500" />;
  };

  const getTextColor = (type: string) => {
    if (type === "deposit") return "text-green-600";
    if (type === "withdrawal") return "text-red-600";
    if (type === "investment") return "text-amber-600";
    return "text-gray-600";
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-gray-50">{getIcon(transaction.type)}</div>
        <div>
          <p className="text-sm font-medium text-bgs-blue">{transaction.description}</p>
          <p className="text-xs text-bgs-gray-medium">{formatDate(transaction.created_at)}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className={`text-sm font-medium ${getTextColor(transaction.type)}`}>
          {formatAmount(transaction.amount, transaction.type)}
        </p>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${getStatusStyle(transaction.status)}`}
        >
          {transaction.status}
        </span>
      </div>
    </div>
  );
}

function NotificationHistoryItem({ notification }: { notification: NotificationItem }) {
  const getIcon = (type: string, category: string) => {
    if (type === "deposit") return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (type === "withdrawal") return <TrendingDown className="w-4 h-4 text-red-500" />;
    if (type === "investment") return <Sparkles className="w-4 h-4 text-purple-500" />;
    return <Bell className="w-4 h-4 text-blue-500" />;
  };

  const getCategoryStyle = (category: string) => {
    if (category === "success") return "bg-green-100 text-green-600";
    if (category === "error") return "bg-red-100 text-red-600";
    if (category === "warning") return "bg-amber-100 text-amber-600";
    return "bg-blue-100 text-blue-600"; // default for info
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-gray-50">
          {getIcon(notification.type, notification.category)}
        </div>
        <div>
          <p className="text-sm font-medium text-bgs-blue">{notification.title}</p>
          <p className="text-xs text-bgs-gray-medium">{formatDate(notification.created_at)}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="text-xs text-bgs-gray-medium">{notification.description.slice(0, 30)}...</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryStyle(notification.category)}`}>
          {notification.read ? "Lu" : "Non lu"}
        </span>
      </div>
    </div>
  );
}
