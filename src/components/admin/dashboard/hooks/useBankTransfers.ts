
import { useState } from "react";
import { BankTransferItem } from "../types/bankTransfer";

export function useBankTransfers() {
  const [processingId, setProcessingId] = useState<string | null>(null);

  // The hook now only provides state information without modification functions
  return {
    processingId
  };
}
