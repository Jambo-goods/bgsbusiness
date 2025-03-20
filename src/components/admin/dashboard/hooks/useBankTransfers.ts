
import { useState } from "react";
import { toast } from "sonner";
import { bankTransferService } from "../services/bankTransferService";
import { BankTransferItem } from "../types/bankTransfer";

export function useBankTransfers() {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isDebug, setIsDebug] = useState<boolean>(true); // Activer le mode debug par défaut

  // Function to directly update bank transfer status
  const updateTransferStatus = async (transfer: BankTransferItem, newStatus: string, processedDate: string | null = null) => {
    try {
      // Validation renforcée des données du transfert
      if (!transfer || !transfer.id) {
        console.error("Transfert invalide pour mise à jour:", transfer);
        toast.error("Erreur: données de transfert invalides");
        return false;
      }

      // Validation stricte de l'ID du transfert
      if (typeof transfer.id !== 'string' || transfer.id.trim() === '') {
        console.error(`ID de transfert invalide: "${transfer.id}"`);
        toast.error("Erreur: ID de transfert invalide");
        return false;
      }

      // Debug log for transfer - includes detailed information for troubleshooting
      console.log("Mise à jour du transfert:", {
        id: transfer.id,
        status: transfer.status,
        user_id: transfer.user_id,
        amount: transfer.amount
      });

      // Marquer comme en cours de traitement pour l'UI
      setProcessingId(transfer.id);
      
      // Store admin token if available (for potential future auth enhancements)
      const adminUser = localStorage.getItem('admin_user') ? 
        JSON.parse(localStorage.getItem('admin_user') || '{}') : {};
      
      if (adminUser?.token) {
        localStorage.setItem('admin_token', adminUser.token);
      }
      
      // Add debug logs with all relevant information
      console.log("Détails de la mise à jour:", {
        id: transfer.id,
        currentStatus: transfer.status,
        newStatus,
        processedDate,
        timestamp: new Date().toISOString()
      });
      
      // Attendre un court délai pour éviter les problèmes de concurrence
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Call the service to update the transfer
      const result = await bankTransferService.updateBankTransfer(
        transfer.id,
        newStatus,
        processedDate
      );
      
      console.log("Résultat de la mise à jour:", result);
      
      if (result.success) {
        toast.success(`Virement mis à jour: ${newStatus}`);
        return true;
      } else {
        console.error("Échec de mise à jour:", result);
        
        // Message d'erreur plus spécifique basé sur le problème
        const errorMessage = result.message || "Échec de la mise à jour";
        
        // Afficher un message différent selon le type d'erreur
        if (errorMessage.includes("n'existe pas")) {
          toast.error("Le virement demandé n'existe pas ou a été supprimé", {
            description: "Veuillez rafraîchir la page"
          });
        } else {
          toast.error(errorMessage, {
            description: "Veuillez réessayer dans quelques instants"
          });
        }
        
        return false;
      }
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error(`Erreur: ${error.message || "Erreur inconnue"}`, {
        description: "Problème technique lors de la mise à jour"
      });
      return false;
    } finally {
      // Add small delay before clearing processing state for better UI feedback
      setTimeout(() => setProcessingId(null), 500);
    }
  };

  // Function to restore a transfer back to pending status
  const restoreTransfer = async (transfer: BankTransferItem) => {
    try {
      if (!transfer || !transfer.id) {
        console.error("Transfert invalide pour restauration:", transfer);
        toast.error("Erreur: données de transfert invalides");
        return false;
      }
      
      setProcessingId(transfer.id);
      toast.info("Restauration du virement en cours...");
      
      console.log("Restauration du transfert:", {
        id: transfer.id,
        currentStatus: transfer.status
      });
      
      // Call the service to restore the transfer (set to pending)
      const result = await bankTransferService.updateBankTransfer(
        transfer.id,
        'pending',
        null // Clear processed date
      );
      
      console.log("Résultat de la restauration:", result);
      
      if (result.success) {
        toast.success("Virement restauré avec succès");
        return true;
      } else {
        console.error("Échec de restauration:", result);
        
        // Message d'erreur spécifique selon le problème
        if (result.message && result.message.includes("n'existe pas")) {
          toast.error("Le virement n'existe plus dans la base de données");
        } else {
          toast.error(result.message || "Échec de la restauration");
        }
        
        return false;
      }
    } catch (error: any) {
      console.error("Erreur lors de la restauration:", error);
      toast.error(`Erreur: ${error.message || "Erreur inconnue"}`);
      return false;
    } finally {
      setTimeout(() => setProcessingId(null), 500);
    }
  };

  return {
    processingId,
    updateTransferStatus,
    restoreTransfer,
    isDebug,
    setIsDebug
  };
}
