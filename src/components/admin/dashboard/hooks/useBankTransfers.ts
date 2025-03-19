
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
      
      // First try with the database function
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
      
      // Show progress toast
      const toastId = toast.loading("Tentative de mise à jour forcée en cours...", { duration: 10000 });
      
      // Use Edge Function directly to bypass all RLS - this has the highest chance of success
      const result = await bankTransferService.directForceBankTransfer(item);
      
      if (result.success) {
        toast.dismiss(toastId);
        toast.success("Mise à jour forcée réussie! Le virement est maintenant marqué comme reçu.");
        
        // Refresh data after success
        setTimeout(() => {
          onSuccess();
        }, 1000);
        
        return;
      }
      
      // If first attempt failed, try the alternative approach through the Edge Function
      console.log("[FORÇAGE] Premier essai échoué, tentative avec méthode alternative...");
      const fallbackResult = await bankTransferService.forceUpdateToReceived(item.id);
      
      if (fallbackResult.success) {
        toast.dismiss(toastId);
        toast.success("Mise à jour réussie via méthode alternative!");
        
        // Refresh data after success
        setTimeout(() => {
          onSuccess();
        }, 1000);
        
        return;
      }
      
      // If both methods failed, show error but still refresh
      toast.dismiss(toastId);
      toast.error(`Échec de toutes les tentatives de mise à jour forcée: ${fallbackResult.message}`);
      console.error("[FORÇAGE] Toutes les méthodes ont échoué:", result.message, fallbackResult.message);
      
      // Still refresh to see current state
      setTimeout(() => {
        onSuccess();
        toast.info("Rafraîchissement des données pour vérification de l'état actuel...");
      }, 2000);
      
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
