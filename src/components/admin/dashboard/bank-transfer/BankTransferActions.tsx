
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, XCircle, ReceiptText, Hammer } from "lucide-react";

interface BankTransferActionsProps {
  needsAction: boolean;
  isReceiptConfirmed: boolean;
  isRejected: boolean;
  hasMisspelledStatus: boolean;
  hasStatusError: boolean;
  showForceButton: boolean;
  onConfirmClick: () => void;
  onRejectDeposit: () => void;
  onConfirmReceipt: () => void;
  onForceClick: () => void;
}

export function BankTransferActions({
  needsAction,
  isReceiptConfirmed,
  isRejected,
  hasMisspelledStatus,
  hasStatusError,
  showForceButton,
  onConfirmClick,
  onRejectDeposit,
  onConfirmReceipt,
  onForceClick
}: BankTransferActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-1">
      {needsAction && (
        <>
          <Button 
            size="sm" 
            className="h-8 bg-green-600 hover:bg-green-700"
            onClick={onConfirmClick}
          >
            <Check className="h-4 w-4 mr-1" />
            Valider
          </Button>
          
          <Button 
            size="sm" 
            variant="destructive" 
            className="h-8"
            onClick={onRejectDeposit}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Rejeter
          </Button>
        </>
      )}
      
      {!isReceiptConfirmed && !isRejected && !hasMisspelledStatus && (
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8"
          onClick={onConfirmReceipt}
        >
          <ReceiptText className="h-4 w-4 mr-1" />
          Confirmer réception
        </Button>
      )}
      
      {hasStatusError && showForceButton && (
        <Button 
          size="sm"
          variant="destructive"
          className="h-8 font-semibold animate-pulse"
          onClick={onForceClick}
        >
          <Hammer className="h-4 w-4 mr-1" />
          FORCER à Reçu
        </Button>
      )}
    </div>
  );
}
