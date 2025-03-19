
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
      console.log("[FORÇAGE] Mise à jour directe du statut pour l'ID:", item.id);
      
      // Afficher message d'information pour indiquer que l'opération est en cours
      toast.info("Tentative de mise à jour forcée en cours...", { duration: 5000 });
      
      // Première tentative avec l'API standard
      const result = await bankTransferService.forceUpdateToReceived(item.id);
      
      if (result.success) {
        toast.success("Virement forcé à 'reçu' avec succès");
        
        // Ajouter un délai important pour s'assurer que les triggers de base de données s'exécutent
        setTimeout(() => {
          onSuccess();
          toast.info("Rafraîchissement des données...");
        }, 3000);
        
        return;
      }
      
      console.error("[FORÇAGE] Première tentative échouée:", result.message);
      toast.warning("Première tentative échouée, essai avec méthode alternative...");
      
      // Deuxième tentative avec API RPC directe
      const directResult = await bankTransferService.directForceBankTransfer(item);
      
      if (directResult.success) {
        toast.success("Mise à jour réussie avec méthode alternative!");
        
        // Ajouter un délai encore plus long pour s'assurer que tout est bien mis à jour
        setTimeout(() => {
          onSuccess();
          toast.info("Rafraîchissement des données...");
        }, 5000);
      } else {
        toast.error(`Échec de toutes les tentatives: ${directResult.message}`);
        console.error("[FORÇAGE] Toutes les tentatives ont échoué:", directResult);
      }
    } catch (error) {
      console.error("[FORÇAGE] Erreur critique lors du forçage:", error);
      toast.error("Une erreur critique est survenue lors du forçage du statut");
    } finally {
      setTimeout(() => {
        setProcessingId(null);
      }, 1000);
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
