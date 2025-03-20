
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowDownIcon, ArrowUpIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

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
  const [showConfirmationAlert, setShowConfirmationAlert] = useState(false);
  
  useEffect(() => {
    // Set up a subscription to withdrawal_requests status changes
    const withdrawalRequestsChannel = supabase
      .channel('withdrawal_requests_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'withdrawal_requests',
        filter: `status=eq.confirmed`,
      }, (payload) => {
        console.log('Withdrawal request status changed to confirmed:', payload);
        setShowConfirmationAlert(true);
        
        // Hide the confirmation alert after 10 seconds
        setTimeout(() => {
          setShowConfirmationAlert(false);
        }, 10000);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(withdrawalRequestsChannel);
    };
  }, []);

  const formattedDate = formatDistanceToNow(
    new Date(item.created_at),
    { addSuffix: true, locale: fr }
  );
  
  // Helper function to extract reference from description
  const extractReference = (text: string) => {
    const match = text.match(/DEP-\d+/);
    return match ? match[0] : null;
  };
  
  // Extraction de la référence pour l'affichage
  const reference = item.itemType === 'transaction' 
    ? extractReference(item.description) 
    : (item.itemType === 'notification' && item.type === 'deposit' 
      ? extractReference(item.description) 
      : null);

  // Function to extract amount from description
  const extractAmountFromDescription = (text: string): number | null => {
    // First try to match patterns like "123€" or "123 €"
    let match = text.match(/(\d+)\s*€/);
    if (match) return Number(match[1]);
    
    // Then try to look for format like "de 123 a été" or "de 1000€ a"
    match = text.match(/de\s+(\d+)(?:\s*€)?\s+/);
    if (match) return Number(match[1]);
    
    // Try another pattern common in notification messages
    match = text.match(/dépôt\s+de\s+(\d+)(?:\s*€)?/i);
    if (match) return Number(match[1]);
    
    return null;
  };

  if (item.itemType === 'transaction') {
    const title = item.type === 'deposit' 
      ? reference 
        ? `Virement bancaire confirmé (réf: ${reference})`
        : 'Dépôt'
      : 'Demande de retrait';
      
    return (
      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
        {/* Show confirmation alert when withdrawal request is confirmed */}
        {showConfirmationAlert && item.type === 'withdrawal' && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4" />
              <span>Demande de retrait confirmée</span>
            </div>
          </div>
        )}
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
              <p className="font-medium">{title}</p>
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
    // Améliorer l'affichage des notifications pour les virements bancaires
    let title = item.title;
    
    if (item.type === 'deposit' && reference) {
      title = `Virement bancaire confirmé (réf: ${reference})`;
    } else if (item.type === 'withdrawal') {
      title = `Demande de retrait ${item.title.toLowerCase()}`;
    }
    
    // Find the correct amount in this priority:
    // 1. From metadata.amount if it's not 0
    // 2. Extract from description
    // 3. Default to 0 only if nothing else works
    let amount = 0;
    
    // Console log for debugging the notification data
    console.log(`Processing notification: ${item.id}`, {
      title: item.title,
      description: item.description,
      metadata: item.metadata
    });
    
    // Try to get amount from metadata first (if it's not 0)
    if (item.metadata?.amount !== undefined && Number(item.metadata.amount) > 0) {
      amount = Number(item.metadata.amount);
    } 
    // If metadata amount is 0 or undefined, try to extract from description
    else if (item.description) {
      const extractedAmount = extractAmountFromDescription(item.description);
      if (extractedAmount !== null && extractedAmount > 0) {
        amount = extractedAmount;
      }
      // If we still don't have an amount, try to extract reference and get amount from title
      else if (reference && item.title) {
        const extractedFromTitle = extractAmountFromDescription(item.title);
        if (extractedFromTitle !== null && extractedFromTitle > 0) {
          amount = extractedFromTitle;
        }
      }
    }
    
    // For deposit confirmations with 0 amount, try to find the pending notification 
    // with the same reference and use its amount
    if (amount === 0 && item.title.includes("reçu") && reference) {
      // This is where we would ideally look for the matching pending deposit
      // But this is complex to implement in the current component.
      // For now we'll rely on the description parsing
      
      // Last resort: Check if the reference is in the description and try to extract amount again
      if (item.description.includes(reference)) {
        const parts = item.description.split(reference);
        if (parts.length > 1) {
          const afterRef = parts[1];
          const extractedAfterRef = extractAmountFromDescription(afterRef);
          if (extractedAfterRef !== null && extractedAfterRef > 0) {
            amount = extractedAfterRef;
          }
        }
      }
    }
    
    return (
      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
        {/* Show confirmation alert when withdrawal request is confirmed and notification is related to withdrawal */}
        {showConfirmationAlert && item.type === 'withdrawal' && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4" />
              <span>Demande de retrait confirmée</span>
            </div>
          </div>
        )}
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <NotificationIcon category={item.category} type={item.type} />
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
            </div>
          </div>
          {/* Afficher le montant avec des classes appropriées */}
          <div className="text-right">
            <span className={`font-semibold ${item.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
              {item.type === 'deposit' ? '+' : '-'}{amount} €
            </span>
          </div>
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
