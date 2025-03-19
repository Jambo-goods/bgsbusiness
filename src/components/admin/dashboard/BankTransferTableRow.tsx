
import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BankTransferItem } from "./types/bankTransfer";
import { StatusBadge } from "./bank-transfer/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { useBankTransfers } from "./hooks/useBankTransfers";
import { toast } from "sonner";

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
  const { updateTransferStatus } = useBankTransfers();
  const [localProcessing, setLocalProcessing] = useState(false);
  
  // Format date nicely
  const formattedDate = item.created_at 
    ? format(new Date(item.created_at), 'dd MMM yyyy HH:mm', { locale: fr })
    : 'Date inconnue';
    
  const isProcessing = processingId === item.id || localProcessing;
  
  const userName = item.profile 
    ? `${item.profile.first_name || ''} ${item.profile.last_name || ''}`.trim() || 'Utilisateur'
    : 'Utilisateur inconnu';

  const isReceiptConfirmed = item.processed === true;
  const isRejected = item.status === 'rejected';
  const isPending = item.status === 'pending';
  const hasMisspelledStatus = item.status === 'receveid'; // Handle this specific case
  
  // Handle confirming receipt
  const handleConfirmReceipt = async () => {
    setLocalProcessing(true);
    try {
      const success = await updateTransferStatus(item, 'received');
      if (success && onStatusUpdate) {
        toast.success("Virement marqué comme reçu");
        onStatusUpdate();
      } else {
        toast.error("Échec de la mise à jour - veuillez réessayer");
      }
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      toast.error("Une erreur s'est produite lors de la mise à jour");
    } finally {
      setLocalProcessing(false);
    }
  };
  
  // Handle rejecting transfer
  const handleRejectTransfer = async () => {
    setLocalProcessing(true);
    try {
      const success = await updateTransferStatus(item, 'rejected');
      if (success && onStatusUpdate) {
        toast.success("Virement rejeté");
        onStatusUpdate();
      } else {
        toast.error("Échec du rejet - veuillez réessayer");
      }
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      toast.error("Une erreur s'est produite lors du rejet");
    } finally {
      setLocalProcessing(false);
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
                {isProcessing ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5 mr-1" />
                )}
                Reçu
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="h-7 bg-red-50 border-red-200 hover:bg-red-100 text-red-700"
                onClick={handleRejectTransfer}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5 mr-1" />
                )}
                Rejeter
              </Button>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
