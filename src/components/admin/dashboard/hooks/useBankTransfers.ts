
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
      console.log("Forçage du statut à 'reçu' pour l'ID:", item.id);
      
      // First attempt
      const { success, message } = await bankTransferService.forceUpdateToReceived(item.id);
      
      if (success) {
        toast.success("Virement forcé à 'reçu' avec succès");
        
        // Add extra delay to ensure database updates propagate
        setTimeout(() => {
          onSuccess();
        }, 2000); // Increased delay to 2 seconds
      } else {
        console.error("Échec du forçage:", message);
        toast.error(`Échec du forçage: ${message}`);
        
        // Second attempt with a different approach if first attempt failed
        if (message.includes("pending") || message.includes("échoué")) {
          toast.info("Tentative alternative en cours...");
          
          // Delay before second attempt
          setTimeout(async () => {
            try {
              // Try again with a different approach
              const secondAttempt = await bankTransferService.forceUpdateToReceived(item.id);
              
              if (secondAttempt.success) {
                toast.success("Seconde tentative réussie!");
                onSuccess();
              } else {
                toast.error("Échec après plusieurs tentatives. Veuillez contacter le support technique.");
              }
            } catch (retryError) {
              console.error("Erreur lors de la seconde tentative:", retryError);
              toast.error("Échec de toutes les tentatives. Rechargez la page et réessayez.");
            } finally {
              setProcessingId(null);
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Erreur lors du forçage du statut:", error);
      toast.error("Une erreur est survenue lors du forçage du statut");
      setProcessingId(null);
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
