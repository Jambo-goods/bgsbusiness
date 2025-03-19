
import { useState } from "react";
import { toast } from "sonner";
import { bankTransferService } from "../services/bankTransferService";
import { BankTransferItem } from "../types/bankTransfer";

export function useBankTransfers() {
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Function to directly update bank transfer status
  const updateTransferStatus = async (transfer: BankTransferItem, newStatus: string, processedDate: string | null = null) => {
    try {
      setProcessingId(transfer.id);
      
      // Store admin token if available
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      if (adminUser?.token) {
        localStorage.setItem('admin_token', adminUser.token);
      }
      
      // Call the service to update the transfer
      const result = await bankTransferService.updateBankTransfer(
        transfer.id,
        newStatus,
        processedDate
      );
      
      if (result.success) {
        let message = "";
        
        switch (newStatus) {
          case 'received':
            message = "Virement marqué comme reçu";
            break;
          case 'rejected':
            message = "Virement rejeté";
            break;
          case 'cancelled':
            message = "Virement annulé";
            break;
          case 'pending':
            message = "Virement restauré en statut 'En attente'";
            break;
          default:
            message = `Virement mis à jour: ${newStatus}`;
        }
        
        toast.success(message);
        return true;
      } else {
        console.error("Échec de mise à jour:", result);
        toast.error(result.message || "Échec de la mise à jour");
        return false;
      }
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error(`Erreur: ${error.message || "Erreur inconnue"}`);
      return false;
    } finally {
      // Add small delay before clearing processing state for UI feedback
      setTimeout(() => setProcessingId(null), 500);
    }
  };

  return {
    processingId,
    updateTransferStatus
  };
}
