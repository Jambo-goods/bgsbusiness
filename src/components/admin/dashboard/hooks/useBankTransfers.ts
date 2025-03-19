
import { useState } from "react";
import { BankTransferItem } from "../types/bankTransfer";
import { bankTransferService } from "../services/bankTransferService";
import { toast } from "sonner";

export function useBankTransfers(onSuccess: () => void) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleConfirmDeposit = async (item: BankTransferItem, amount: number) => {
    try {
      setProcessingId(item.id);
      const success = await bankTransferService.confirmDeposit(item, amount);
      if (success) {
        toast.success("Dépôt confirmé avec succès");
        onSuccess();
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors du traitement de la confirmation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectDeposit = async (item: BankTransferItem) => {
    try {
      setProcessingId(item.id);
      const success = await bankTransferService.rejectDeposit(item);
      if (success) {
        toast.success("Dépôt rejeté avec succès");
        onSuccess();
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors du traitement du rejet");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReceipt = async (item: BankTransferItem) => {
    try {
      setProcessingId(item.id);
      
      const success = await bankTransferService.confirmReceipt(item);
      
      if (success) {
        toast.success("Réception confirmée avec succès");
        onSuccess();
      } else {
        toast.error("Échec de la confirmation de réception");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors du traitement de la confirmation de réception");
    } finally {
      setProcessingId(null);
    }
  };

  return {
    processingId,
    handleConfirmDeposit,
    handleRejectDeposit,
    handleConfirmReceipt
  };
}
