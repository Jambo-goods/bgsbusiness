
import { useState } from "react";
import { toast } from "sonner";
import { bankTransferService } from "../services/bankTransferService";
import { BankTransferItem } from "../types/bankTransfer";

export function useBankTransfers() {
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Add function to handle marking a transfer as received
  const confirmReceipt = async (transfer: BankTransferItem) => {
    try {
      setProcessingId(transfer.id);
      const success = await bankTransferService.confirmReceipt(transfer);
      
      if (success) {
        toast.success("Statut du virement mis à jour: Reçu");
        return true;
      } else {
        toast.error("Échec de la mise à jour du statut");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation de réception:", error);
      toast.error("Une erreur est survenue lors de la mise à jour");
      return false;
    } finally {
      setProcessingId(null);
    }
  };

  // Add function to handle rejecting a transfer
  const rejectTransfer = async (transfer: BankTransferItem) => {
    try {
      setProcessingId(transfer.id);
      const success = await bankTransferService.rejectDeposit(transfer);
      
      if (success) {
        toast.success("Virement rejeté avec succès");
        return true;
      } else {
        toast.error("Échec du rejet du virement");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors du rejet du virement:", error);
      toast.error("Une erreur est survenue lors du rejet");
      return false;
    } finally {
      setProcessingId(null);
    }
  };

  return {
    processingId,
    confirmReceipt,
    rejectTransfer
  };
}
