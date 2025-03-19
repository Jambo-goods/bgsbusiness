
import { useState } from "react";
import { toast } from "sonner";
import { bankTransferService } from "../services/bankTransferService";
import { BankTransferItem } from "../types/bankTransfer";

export function useBankTransfers() {
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Function to handle marking a transfer as received
  const confirmReceipt = async (transfer: BankTransferItem) => {
    try {
      setProcessingId(transfer.id);
      
      // Store admin token if available (for authenticated requests)
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      if (adminUser?.token) {
        localStorage.setItem('admin_token', adminUser.token);
      }
      
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

  // Function to handle rejecting a transfer
  const rejectTransfer = async (transfer: BankTransferItem) => {
    try {
      setProcessingId(transfer.id);
      
      // Store admin token if available (for authenticated requests)
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      if (adminUser?.token) {
        localStorage.setItem('admin_token', adminUser.token);
      }
      
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

  // Function to directly update bank transfer status
  const updateTransferStatus = async (transfer: BankTransferItem, newStatus: string) => {
    try {
      setProcessingId(transfer.id);
      
      // Use current date as processed date for received status
      const processedDate = (newStatus === 'received' || newStatus === 'reçu' || newStatus === 'rejected') 
        ? new Date().toISOString() 
        : null;
      
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
        toast.success(`Virement mis à jour: ${newStatus}`);
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
    confirmReceipt,
    rejectTransfer,
    updateTransferStatus
  };
}
