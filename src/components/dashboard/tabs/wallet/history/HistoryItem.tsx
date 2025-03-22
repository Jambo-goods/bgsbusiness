
import React from "react";
import { CreditCard, ArrowUpRight, ArrowDownRight, Clock, Check, X, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CombinedHistoryItem } from "@/components/dashboard/tabs/wallet/history/useWalletHistory";
import { FixDepositButton } from "@/components/dashboard/wallet/FixDepositButton";

export interface HistoryItemType extends CombinedHistoryItem {}

interface HistoryItemProps {
  item: HistoryItemType;
}

export default function HistoryItem({ item }: HistoryItemProps) {
  // Define icon and color based on transaction type
  let icon = <CreditCard className="h-4 w-4 text-gray-400" />;
  let amountColor = "text-gray-700";

  // Set icon and color based on transaction type
  if (item.type === "deposit") {
    icon = <ArrowDownRight className="h-4 w-4 text-green-500" />;
    amountColor = "text-green-600";
  } else if (item.type === "withdrawal") {
    icon = <ArrowUpRight className="h-4 w-4 text-amber-500" />;
    amountColor = "text-amber-600";
  }

  // Maps status to appropriate UI elements
  let statusBadge = null;
  let statusIcon = null;

  switch (item.status?.toLowerCase()) {
    case "pending":
      statusBadge = <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">En attente</Badge>;
      statusIcon = <Clock className="h-4 w-4 text-amber-500" />;
      break;
    case "completed":
      statusBadge = <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Complété</Badge>;
      statusIcon = <Check className="h-4 w-4 text-green-500" />;
      break;
    case "failed":
      statusBadge = <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Échoué</Badge>;
      statusIcon = <X className="h-4 w-4 text-red-500" />;
      break;
    case "processing":
      statusBadge = <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En cours</Badge>;
      statusIcon = <Clock className="h-4 w-4 text-blue-500" />;
      break;
    default:
      if (item.type === "deposit") {
        statusBadge = <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Dépôt</Badge>;
      } else if (item.type === "withdrawal") {
        statusBadge = <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Retrait</Badge>;
      } else {
        statusBadge = <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Transaction</Badge>;
      }
      statusIcon = <AlertCircle className="h-4 w-4 text-gray-400" />;
  }

  // Check if this is a transaction that needs correction (deposit in database but not in wallet)
  const needsCorrection = 
    item.source === 'transaction' && 
    item.type === 'deposit' && 
    !item.confirmed && 
    item.status !== 'completed';

  // Extract reference code for deposits if available
  let referenceCode = null;
  if (item.type === 'deposit' && item.description) {
    const match = item.description.match(/DEP-\d+/);
    referenceCode = match ? match[0] : null;
  }

  // Extract withdrawal ID if available
  let withdrawalId = null;
  if (item.type === 'withdrawal') {
    if (item.source === 'transaction' && item.description) {
      const match = item.description.match(/#([a-f0-9-]+)/i);
      withdrawalId = match ? match[1] : null;
    } else if (item.source === 'notification' && item.metadata?.withdrawalId) {
      withdrawalId = item.metadata.withdrawalId;
    }
  }

  return (
    <Card className="overflow-hidden border border-gray-200">
      <div className="p-4 flex justify-between items-start">
        <div className="flex items-start space-x-4">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {item.title || (item.type === 'deposit' ? 'Dépôt' : item.type === 'withdrawal' ? 'Retrait' : 'Transaction')}
            </div>
            <div className="text-sm text-gray-600 mt-1 max-w-md">
              {item.description}
            </div>
            <div className="flex items-center mt-2 space-x-2">
              {statusBadge}
              <span className="text-xs text-gray-500">{item.formattedDate}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className={`font-bold text-lg ${amountColor}`}>
            {item.type === "withdrawal" ? "-" : "+"}{item.amount}€
          </div>
          <div className="flex items-center mt-2">
            {statusIcon}
          </div>
          {needsCorrection && referenceCode && (
            <div className="mt-2">
              <FixDepositButton 
                reference={referenceCode} 
                amount={item.amount}
              />
            </div>
          )}
          {item.source === 'notification' && item.type === 'withdrawal' && withdrawalId && item.status !== 'completed' && (
            <div className="mt-2">
              <FixDepositButton 
                withdrawalId={withdrawalId} 
                amount={item.amount}
                label={`Marquer le retrait de ${item.amount}€ comme payé`}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
