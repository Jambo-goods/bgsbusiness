
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
      // Validation plus stricte des données du transfert
      if (!transfer || !transfer.id) {
        console.error("Transfert invalide:", transfer);
        toast.error("Erreur: données de transfert invalides");
        return false;
      }

      // Validation des données du transfert
      if (typeof transfer.id !== 'string' || transfer.id.trim() === '') {
        console.error("ID de transfert invalide:", transfer.id);
        toast.error("Erreur: ID de transfert invalide");
        return false;
      }

      setProcessingId(transfer.id);
      
      // Store admin token if available
      const adminUser = localStorage.getItem('admin_user') ? 
        JSON.parse(localStorage.getItem('admin_user') || '{}') : {};
      
      if (adminUser?.token) {
        localStorage.setItem('admin_token', adminUser.token);
      }
      
      // Add debug logs
      console.log("Updating transfer status:", {
        id: transfer.id,
        currentStatus: transfer.status,
        newStatus,
        processedDate
      });
      
      // Call the service to update the transfer
      // Use direct Supabase call for more reliable operation
      const result = await bankTransferService.updateBankTransfer(
        transfer.id,
        newStatus,
        processedDate
      );
      
      console.log("Update result:", result);
      
      if (result.success) {
        toast.success(`Virement mis à jour: ${newStatus}`);
        return true;
      } else {
        console.error("Échec de mise à jour:", result);
        
        // Message d'erreur plus spécifique
        const errorMessage = result.message || "Échec de la mise à jour";
        toast.error(errorMessage, {
          description: "Veuillez rafraîchir la page et réessayer"
        });
        
        return false;
      }
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error(`Erreur: ${error.message || "Erreur inconnue"}`, {
        description: "Problème technique lors de la mise à jour"
      });
      return false;
    } finally {
      // Add small delay before clearing processing state for UI feedback
      setTimeout(() => setProcessingId(null), 500);
    }
  };

  // New function to restore a transfer back to pending status
  const restoreTransfer = async (transfer: BankTransferItem) => {
    try {
      if (!transfer || !transfer.id) {
        console.error("Transfert invalide pour restauration:", transfer);
        toast.error("Erreur: données de transfert invalides");
        return false;
      }
      
      setProcessingId(transfer.id);
      toast.info("Restauration du virement en cours...");
      
      console.log("Restoring transfer:", {
        id: transfer.id,
        currentStatus: transfer.status
      });
      
      // Call the service to restore the transfer (set to pending)
      const result = await bankTransferService.updateBankTransfer(
        transfer.id,
        'pending',
        null // Clear processed date
      );
      
      console.log("Restore result:", result);
      
      if (result.success) {
        toast.success("Virement restauré avec succès");
        return true;
      } else {
        console.error("Échec de restauration:", result);
        toast.error(result.message || "Échec de la restauration");
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
