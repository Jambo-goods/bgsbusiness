
import { useState } from "react";
import { toast } from "sonner";
import { bankTransferService } from "../services/bankTransferService";
import { BankTransferItem } from "../types/bankTransfer";

export function useBankTransfers() {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const rejectTransfer = async (item: BankTransferItem) => {
    try {
      setProcessingId(item.id);
      const result = await bankTransferService.updateBankTransfer(
        item.id,
        'rejected',
        new Date().toISOString()
      );
      
      if (result.success) {
        toast.success("Virement mis en statut 'rejeté'");
        return true;
      } else {
        toast.error(`Échec: ${result.message}`);
        return false;
      }
    } catch (error: any) {
      toast.error(`Erreur: ${error.message || "Erreur inconnue"}`);
      return false;
    } finally {
      setProcessingId(null);
    }
  };

  return {
    processingId,
    rejectTransfer
  };
}
