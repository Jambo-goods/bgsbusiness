
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
        toast.success("Dépôt confirmé avec succès");
        onSuccess();
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
        toast.success("Dépôt rejeté avec succès");
        onSuccess();
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
        toast.success("Réception confirmée avec succès");
        onSuccess();
      } else {
        toast.error("Échec de la confirmation. Essayez d'utiliser l'option 'FORCER'");
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation de la réception:", error);
      toast.error("Une erreur est survenue lors du traitement de la confirmation de réception");
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleForceToReceived = async (item: BankTransferItem) => {
    try {
      setProcessingId(item.id);
      console.log("[FORÇAGE] Tentative de mise à jour forcée pour l'ID:", item.id);
      
      // Display info message to indicate the operation is in progress
      toast.info("Tentative de mise à jour forcée en cours...", { duration: 5000 });
      
      // Try with direct force method first (using Edge Function)
      const directResult = await bankTransferService.directForceBankTransfer(item);
      
      if (directResult.success) {
        toast.success("Mise à jour forcée réussie! Le virement est maintenant marqué comme reçu.");
        
        // Add delay to ensure everything is properly updated
        setTimeout(() => {
          onSuccess();
          toast.info("Rafraîchissement des données...");
        }, 3000);
        
        return;
      }
      
      // If first method failed, show error and still refresh
      console.error("[FORÇAGE] La méthode Edge Function a échoué:", directResult.message);
      toast.error(`Échec de la mise à jour: ${directResult.message}`);
      
      // Refresh anyway in case something changed
      setTimeout(() => {
        onSuccess();
        toast.info("Rafraîchissement des données pour vérification...");
      }, 3000);
    } catch (error) {
      console.error("[FORÇAGE] Erreur critique lors du forçage:", error);
      toast.error("Une erreur critique est survenue lors du forçage du statut");
    } finally {
      setTimeout(() => {
        setProcessingId(null);
      }, 2000);
    }
  };

  return {
    processingId,
    handleConfirmDeposit,
    handleRejectDeposit,
    handleConfirmReceipt,
    handleForceToReceived
  };
}
