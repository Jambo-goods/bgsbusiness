
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BankTransferItem } from "./types/bankTransfer";
import { StatusBadge } from "./bank-transfer/StatusBadge";
import { Button } from "@/components/ui/button";
import { XCircle, Loader2 } from "lucide-react";

interface BankTransferTableRowProps {
  item: BankTransferItem;
  processingId: string | null;
  rejectTransfer?: (item: BankTransferItem) => Promise<boolean>;
}

export default function BankTransferTableRow({
  item,
  processingId,
  rejectTransfer
}: BankTransferTableRowProps) {
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
  const hasMisspelledStatus = item.status === 'receveid'; // Handle this specific case
  
  const handleRejectTransfer = async () => {
    if (rejectTransfer) {
      await rejectTransfer(item);
    }
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
        <div className="flex items-center space-x-2">
          <StatusBadge
            status={item.status}
            hasMisspelledStatus={hasMisspelledStatus}
            isProcessed={!!item.processed}
          />
          
          {!isRejected && rejectTransfer && (
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 px-2 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
              onClick={handleRejectTransfer}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              Rejeter
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
