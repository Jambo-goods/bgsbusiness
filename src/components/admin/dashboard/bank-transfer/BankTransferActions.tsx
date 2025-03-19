
import React from "react";

interface BankTransferActionsProps {
  isReceiptConfirmed: boolean;
  isRejected: boolean;
  hasMisspelledStatus: boolean;
}

export function BankTransferActions({
  isReceiptConfirmed,
  isRejected,
  hasMisspelledStatus
}: BankTransferActionsProps) {
  // Now this component only displays status text without any action buttons
  let statusText = "En attente de traitement";
  
  if (isReceiptConfirmed) {
    statusText = "Réception confirmée";
  } else if (isRejected) {
    statusText = "Rejeté";
  } else if (hasMisspelledStatus) {
    statusText = "Statut incorrect";
  }
  
  return (
    <div className="text-sm text-gray-500">
      {statusText}
    </div>
  );
}
