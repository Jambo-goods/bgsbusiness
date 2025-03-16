
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowDownIcon, ArrowUpIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Base item properties shared between transactions and notifications
export interface HistoryBaseItem {
  id: string;
  created_at: string;
  itemType: 'transaction' | 'notification';
}

// Transaction item from wallet_transactions table
export interface TransactionItem extends HistoryBaseItem {
  itemType: 'transaction';
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: string;
  description: string;
}

// Notification item from notifications table
export interface NotificationItem extends HistoryBaseItem {
  itemType: 'notification';
  title: string;
  description: string;
  type: string;
  read: boolean;
  category: string;
  metadata: Record<string, any>;
}

// Union type for all history items
export type HistoryItemType = TransactionItem | NotificationItem;

interface HistoryItemProps {
  item: HistoryItemType;
}

export default function HistoryItem({ item }: HistoryItemProps) {
  const formattedDate = formatDistanceToNow(
    new Date(item.created_at),
    { addSuffix: true, locale: fr }
  );

  if (item.itemType === 'transaction') {
    return (
      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${item.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'}`}>
              {item.type === 'deposit' ? (
                <ArrowDownIcon className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowUpIcon className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="font-medium">{item.description || (item.type === 'deposit' ? 'Dépôt' : 'Retrait')}</p>
              <p className="text-sm text-gray-500">{formattedDate}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`font-semibold ${item.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
              {item.type === 'deposit' ? '+' : '-'}{item.amount} €
            </span>
            <StatusBadge status={item.status} />
          </div>
        </div>
      </div>
    );
  } else {
    // It's a notification
    return (
      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <NotificationIcon category={item.category} type={item.type} />
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
            </div>
          </div>
          {item.metadata?.amount && (
            <div className="text-right">
              <span className={`font-semibold ${item.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                {item.type === 'deposit' ? '+' : '-'}{item.metadata.amount} €
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

// Helper component for displaying notification icons
function NotificationIcon({ category, type }: { category: string, type: string }) {
  switch (category) {
    case 'success':
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    case 'error':
      return <XCircleIcon className="h-5 w-5 text-red-600" />;
    case 'warning':
      return <XCircleIcon className="h-5 w-5 text-amber-500" />;
    case 'info':
    default:
      if (type === 'deposit') {
        return <ArrowDownIcon className="h-5 w-5 text-blue-500" />;
      } else if (type === 'withdrawal') {
        return <ArrowUpIcon className="h-5 w-5 text-blue-500" />;
      }
      return <ClockIcon className="h-5 w-5 text-blue-500" />;
  }
}

// Helper component for displaying status badges
function StatusBadge({ status }: { status: string }) {
  let variant = "";
  let label = "";

  switch (status) {
    case 'completed':
      variant = "bg-green-100 text-green-800";
      label = "Complété";
      break;
    case 'pending':
      variant = "bg-amber-100 text-amber-800";
      label = "En attente";
      break;
    case 'processing':
      variant = "bg-blue-100 text-blue-800";
      label = "En traitement";
      break;
    case 'rejected':
      variant = "bg-red-100 text-red-800";
      label = "Rejeté";
      break;
    default:
      variant = "bg-gray-100 text-gray-800";
      label = status;
  }

  return (
    <Badge variant="outline" className={`${variant} border-0`}>
      {label}
    </Badge>
  );
}
