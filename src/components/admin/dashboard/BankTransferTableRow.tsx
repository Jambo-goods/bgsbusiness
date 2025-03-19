
import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BankTransferItem } from "./types/bankTransfer";
import { StatusBadge } from "./bank-transfer/StatusBadge";
import { BankTransferActions } from "./bank-transfer/BankTransferActions";
import { ConfirmDepositDialog } from "./bank-transfer/ConfirmDepositDialog";
import { ForceToReceivedDialog } from "./bank-transfer/ForceToReceivedDialog";

interface BankTransferTableRowProps {
  item: BankTransferItem;
  processingId: string | null;
  onConfirmDeposit: (item: BankTransferItem, amount: number) => Promise<void>;
  onRejectDeposit: (item: BankTransferItem) => Promise<void>;
  onConfirmReceipt: (item: BankTransferItem) => Promise<void>;
  onForceToReceived?: (item: BankTransferItem) => Promise<void>;
}

export default function BankTransferTableRow({
  item,
  processingId,
  onConfirmDeposit,
  onRejectDeposit,
  onConfirmReceipt,
  onForceToReceived
}: BankTransferTableRowProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showForceDialog, setShowForceDialog] = useState(false);
  const [depositAmount, setDepositAmount] = useState(item.amount?.toString() || "");
  
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
  const needsAction = isPending;
  const hasMisspelledStatus = item.status === 'receveid'; // Handle this specific case
  const hasPersistenceIssue = isPending || hasMisspelledStatus;
  const hasStatusError = hasPersistenceIssue || item.status !== 'received';
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.,]/g, "");
    setDepositAmount(value);
  };
  
  const handleConfirmClick = () => {
    setShowConfirmDialog(true);
  };
  
  const handleConfirmDialogClose = () => {
    setShowConfirmDialog(false);
  };
  
  const handleForceClick = () => {
    setShowForceDialog(true);
  };
  
  const handleForceDialogClose = () => {
    setShowForceDialog(false);
  };
  
  const handleConfirmDeposit = async () => {
    setShowConfirmDialog(false);
    const amountValue = parseFloat(depositAmount.replace(",", "."));
    await onConfirmDeposit(item, amountValue);
  };
  
  const handleForceToReceived = async () => {
    setShowForceDialog(false);
    if (onForceToReceived) {
      await onForceToReceived(item);
    }
  };
  
  return (
    <>
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
          <StatusBadge
            status={item.status}
            hasMisspelledStatus={hasMisspelledStatus}
            isProcessed={!!item.processed}
          />
        </TableCell>
        
        <TableCell className="text-right space-x-1">
          {isProcessing ? (
            <div className="flex justify-end">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <BankTransferActions
              needsAction={needsAction}
              isReceiptConfirmed={isReceiptConfirmed}
              isRejected={isRejected}
              hasMisspelledStatus={hasMisspelledStatus}
              hasStatusError={hasStatusError}
              onConfirmClick={handleConfirmClick}
              onRejectDeposit={() => onRejectDeposit(item)}
              onConfirmReceipt={() => onConfirmReceipt(item)}
              onForceClick={handleForceClick}
              showForceButton={!!onForceToReceived}
            />
          )}
        </TableCell>
      </TableRow>
      
      <ConfirmDepositDialog
        open={showConfirmDialog}
        onOpenChange={handleConfirmDialogClose}
        depositAmount={depositAmount}
        onAmountChange={handleAmountChange}
        onConfirm={handleConfirmDeposit}
      />
      
      <ForceToReceivedDialog
        open={showForceDialog}
        onOpenChange={handleForceDialogClose}
        onForce={handleForceToReceived}
        item={item}
        userName={userName}
      />
    </>
  );
}
