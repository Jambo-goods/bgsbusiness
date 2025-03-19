
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
      console.log("[FORÇAGE] Mise à jour directe du statut pour l'ID:", item.id);
      
      // Afficher message d'information pour indiquer que l'opération est en cours
      toast.info("Tentative de mise à jour forcée en cours...", { duration: 5000 });
      
      // Première tentative avec directForceBankTransfer
      const directResult = await bankTransferService.directForceBankTransfer(item);
      
      if (directResult.success) {
        toast.success("Mise à jour réussie! Virement marqué comme reçu.");
        
        // Ajouter un délai long pour s'assurer que tout est bien mis à jour
        setTimeout(() => {
          onSuccess();
          toast.info("Rafraîchissement des données...");
        }, 5000);
        
        return;
      }
      
      console.error("[FORÇAGE] Première tentative échouée:", directResult.message);
      toast.warning("Première tentative échouée, essai avec méthode alternative...");
      
      // Deuxième tentative avec l'autre méthode
      const result = await bankTransferService.forceUpdateToReceived(item.id);
      
      if (result.success) {
        toast.success("Virement forcé à 'reçu' avec succès");
        
        // Ajouter un délai important pour s'assurer que les triggers de base de données s'exécutent
        setTimeout(() => {
          onSuccess();
          toast.info("Rafraîchissement des données...");
        }, 5000);
      } else {
        toast.error(`Échec de toutes les tentatives: ${result.message}`);
        console.error("[FORÇAGE] Toutes les tentatives ont échoué:", result);
        
        // Dernière tentative avec méthode d'update standard
        const standardResult = await bankTransferService.updateBankTransfer(
          item.id,
          'received',
          new Date().toISOString()
        );
        
        if (standardResult.success) {
          toast.success("Mise à jour réussie avec la méthode standard!");
          setTimeout(() => {
            onSuccess();
          }, 3000);
        } else {
          toast.error("Toutes les méthodes ont échoué. Contactez l'équipe technique.");
        }
      }
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
