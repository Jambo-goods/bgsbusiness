
import { useState } from "react";
import { BankTransferItem } from "../types/bankTransfer";
import { bankTransferService } from "../services/bankTransferService";
import { toast } from "sonner";

export function useBankTransfers(onSuccess: () => void) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleConfirmDeposit = async (item: BankTransferItem, amount: number) => {
    try {
      setProcessingId(item.id);
      console.log("Confirmation du dépôt pour l'ID:", item.id);
      const success = await bankTransferService.confirmDeposit(item, amount);
      if (success) {
        onSuccess();
        toast.success("Dépôt confirmé avec succès", {
          description: `Le dépôt de ${amount}€ a été validé et ajouté au portefeuille de l'utilisateur.`
        });
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation du dépôt:", error);
      toast.error("Une erreur est survenue lors du traitement de la confirmation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectDeposit = async (item: BankTransferItem) => {
    try {
      setProcessingId(item.id);
      console.log("Rejet du dépôt pour l'ID:", item.id);
      const success = await bankTransferService.rejectDeposit(item);
      if (success) {
        onSuccess();
        toast.success("Dépôt rejeté", {
          description: "La demande de dépôt a été rejetée."
        });
      }
    } catch (error) {
      console.error("Erreur lors du rejet du dépôt:", error);
      toast.error("Une erreur est survenue lors du traitement du rejet");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReceipt = async (item: BankTransferItem) => {
    try {
      setProcessingId(item.id);
      console.log("Confirmation de la réception pour l'ID:", item.id);
      const success = await bankTransferService.confirmReceipt(item);
      if (success) {
        onSuccess();
        toast.success("Réception confirmée", {
          description: "La réception du virement a été confirmée."
        });
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation de la réception:", error);
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
