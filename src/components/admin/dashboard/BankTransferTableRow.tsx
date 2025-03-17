
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Check, X, Clock, ArrowRight } from "lucide-react";
import { BankTransferItem } from "./types/bankTransfer";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface BankTransferTableRowProps {
  item: BankTransferItem;
  processingId: string | null;
  onConfirmDeposit: (item: BankTransferItem, amount: number) => Promise<void>;
  onRejectDeposit: (item: BankTransferItem) => Promise<void>;
  onConfirmReceipt: (item: BankTransferItem) => Promise<void>;
}

export default function BankTransferTableRow({
  item,
  processingId,
  onConfirmDeposit,
  onRejectDeposit,
  onConfirmReceipt
}: BankTransferTableRowProps) {
  const isProcessing = processingId === item.id;
  const isPending = item.status === "pending";
  const isWaitingForReception = !item.receipt_confirmed && item.status !== "rejected";
  
  // Format the created_at date properly
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Date inconnue";
    }
  };

  const formattedDate = formatDate(item.created_at);
  const userName = `${item.profile?.first_name || ''} ${item.profile?.last_name || ''}`.trim();
  
  console.log("Rendering bank transfer row:", item);

  return (
    <TableRow key={item.id} className="hover:bg-gray-50">
      <TableCell className="font-medium">{formattedDate}</TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{userName || "Utilisateur inconnu"}</p>
          <p className="text-sm text-gray-500">{item.profile?.email || "Email non disponible"}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{item.amount} €</span>
          <span className="text-sm text-gray-500 truncate max-w-[10rem]">{item.description || "Virement bancaire"}</span>
        </div>
      </TableCell>
      <TableCell>
        {isWaitingForReception ? (
          <div className="flex items-center">
            <button
              onClick={() => onConfirmReceipt(item)}
              disabled={isProcessing || !isPending}
              className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-800 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isProcessing ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  <span>En attente</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" />
              <span>Confirmé</span>
            </span>
          </div>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {isPending ? (
            <>
              <button
                onClick={() => onConfirmDeposit(item, item.amount)}
                disabled={isProcessing}
                className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100 disabled:opacity-50"
                title="Confirmer le dépôt"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => onRejectDeposit(item)}
                disabled={isProcessing}
                className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50"
                title="Rejeter le dépôt"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <span className="text-sm font-medium">
              {item.status === "completed" ? (
                <span className="text-green-600">Validé</span>
              ) : item.status === "rejected" ? (
                <span className="text-red-600">Rejeté</span>
              ) : (
                <span className="text-blue-600">{item.status}</span>
              )}
            </span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
