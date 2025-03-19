
import { useState } from "react";
import { BankTransferItem } from "../types/bankTransfer";
import { bankTransferService } from "../services/bankTransferService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useBankTransfers(onSuccess: () => void) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleConfirmDeposit = async (item: BankTransferItem, amount: number) => {
    try {
      setProcessingId(item.id);
      const success = await bankTransferService.confirmDeposit(item, amount);
      if (success) {
        toast.success("Dépôt confirmé avec succès");
        onSuccess();
      }
    } catch (error) {
      console.error("Erreur confirmDeposit:", error);
      toast.error("Une erreur est survenue lors du traitement de la confirmation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectDeposit = async (item: BankTransferItem) => {
    try {
      setProcessingId(item.id);
      const success = await bankTransferService.rejectDeposit(item);
      if (success) {
        toast.success("Dépôt rejeté avec succès");
        onSuccess();
      }
    } catch (error) {
      console.error("Erreur rejectDeposit:", error);
      toast.error("Une erreur est survenue lors du traitement du rejet");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReceipt = async (item: BankTransferItem) => {
    try {
      setProcessingId(item.id);
      
      // Utilisation directe de RPC pour contourner les restrictions RLS
      const { data, error } = await supabase.rpc('admin_update_bank_transfer', {
        transfer_id: item.id,
        new_status: 'received',
        processed: true,
        notes: `Réception confirmée par admin le ${new Date().toLocaleDateString('fr-FR')}`
      });
      
      if (error) {
        console.error("Erreur RPC admin_update_bank_transfer:", error);
        toast.error("Échec de la confirmation de réception via RPC");
        
        // Fallback à la méthode standard
        const success = await bankTransferService.confirmReceipt(item);
        if (success) {
          toast.success("Réception confirmée avec succès");
          onSuccess();
        } else {
          toast.error("Échec de la confirmation de réception");
        }
      } else {
        console.log("Résultat RPC:", data);
        toast.success("Réception confirmée avec succès via RPC");
        onSuccess();
      }
    } catch (error) {
      console.error("Erreur confirmReceipt:", error);
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
