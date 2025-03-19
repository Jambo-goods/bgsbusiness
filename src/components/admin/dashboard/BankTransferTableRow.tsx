
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BankTransferItem } from "./types/bankTransfer";
import { StatusBadge } from "./bank-transfer/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useBankTransfers } from "./hooks/useBankTransfers";

interface BankTransferTableRowProps {
  item: BankTransferItem;
  processingId: string | null;
  onStatusUpdate?: () => void;
}

export default function BankTransferTableRow({
  item,
  processingId,
  onStatusUpdate
}: BankTransferTableRowProps) {
  const { confirmReceipt, rejectTransfer, updateTransferStatus } = useBankTransfers();
  
  // Format date nicely
  const formattedDate = item.created_at 
    ? format(new Date(item.created_at), 'dd MMM yyyy HH:mm', { locale: fr })
    : 'Date inconnue';
    
  const isProcessing = processingId === item.id;
  
  const userName = item.profile 
    ? `${item.profile.first_name || ''} ${item.profile.last_name || ''}`.trim() || 'Utilisateur'
    : 'Utilisateur inconnu';

  const isReceiptConfirmed = item.processed === true;
  const isRejected = item.status === 'rejected';
  const isPending = item.status === 'pending';
  const hasMisspelledStatus = item.status === 'receveid'; // Handle this specific case
  
  // Handle confirming receipt - now uses updateTransferStatus
  const handleConfirmReceipt = async () => {
    const success = await updateTransferStatus(item, 'received');
    if (success && onStatusUpdate) onStatusUpdate();
  };
  
  // Handle rejecting transfer - now uses updateTransferStatus
  const handleRejectTransfer = async () => {
    const success = await updateTransferStatus(item, 'rejected');
    if (success && onStatusUpdate) onStatusUpdate();
  };
  
  return (
    <TableRow className={isProcessing ? "bg-gray-50" : ""}>
      <TableCell className="font-medium">
        {formattedDate}
        <div className="text-xs text-gray-500">Ref: {item.reference || 'N/A'}</div>
      </TableCell>
      
      <TableCell>
        <div className="flex flex-col">
          <span>{userName}</span>
          <span className="text-xs text-gray-500">{item.profile?.email || 'Email inconnu'}</span>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex flex-col">
          <span>{item.reference || 'N/A'}</span>
          <span className="text-xs text-gray-500">
            {item.description || `Virement - ${item.amount || 0}€`}
          </span>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <StatusBadge
            status={item.status}
            hasMisspelledStatus={hasMisspelledStatus}
            isProcessed={!!item.processed}
          />
          
          {isPending && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
                onClick={handleConfirmReceipt}
                disabled={isProcessing}
              >
                <Check className="h-3.5 w-3.5 mr-1" /> Reçu
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="h-7 bg-red-50 border-red-200 hover:bg-red-100 text-red-700"
                onClick={handleRejectTransfer}
                disabled={isProcessing}
              >
                <X className="h-3.5 w-3.5 mr-1" /> Rejeter
              </Button>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
