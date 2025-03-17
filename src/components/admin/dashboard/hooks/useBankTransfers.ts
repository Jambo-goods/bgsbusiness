
import { useState } from "react";
import { BankTransferItem } from "../types/bankTransfer";
import { bankTransferService } from "../services/bankTransferService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useBankTransfers(refreshData: () => void) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleConfirmDeposit = async (item: BankTransferItem, amount: number) => {
    try {
      setProcessingId(item.id);
      console.log("Confirming deposit:", item);
      
      // First check if we need to update bank_transfers table
      const { data: bankTransfer } = await supabase
        .from("bank_transfers")
        .select("*")
        .eq("id", item.id)
        .maybeSingle();
      
      if (bankTransfer) {
        // Update in the bank_transfers table
        const { error } = await supabase
          .from("bank_transfers")
          .update({
            status: 'received',
            processed: true,
            processed_at: new Date().toISOString()
          })
          .eq("id", item.id);
          
        if (error) {
          console.error("Error updating bank transfer:", error);
          toast.error("Erreur lors de la confirmation du virement");
          return false;
        }
        
        toast.success("Le virement bancaire a été confirmé");
        refreshData();
        return true;
      } else {
        // Use the regular service
        try {
          const success = await bankTransferService.confirmDeposit(item, amount);
          if (success) {
            refreshData();
          }
          return success;
        } catch (error) {
          console.error("Error in bankTransferService.confirmDeposit:", error);
          toast.error("Erreur lors de la confirmation via le service");
          return false;
        }
      }
    } catch (error) {
      console.error("Error confirming deposit:", error);
      toast.error("Une erreur s'est produite lors de la confirmation");
      return false;
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectDeposit = async (item: BankTransferItem) => {
    try {
      setProcessingId(item.id);
      console.log("Rejecting deposit:", item);
      
      // First check if we need to update bank_transfers table
      const { data: bankTransfer } = await supabase
        .from("bank_transfers")
        .select("*")
        .eq("id", item.id)
        .maybeSingle();
      
      if (bankTransfer) {
        // Update in the bank_transfers table
        const { error } = await supabase
          .from("bank_transfers")
          .update({
            status: 'rejected',
            processed: true,
            processed_at: new Date().toISOString(),
            notes: 'Rejeté par un administrateur'
          })
          .eq("id", item.id);
          
        if (error) {
          console.error("Error rejecting bank transfer:", error);
          toast.error("Erreur lors du rejet du virement");
          return false;
        }
        
        toast.success("Le virement bancaire a été rejeté");
        refreshData();
        return true;
      } else {
        // Use the regular service
        try {
          const success = await bankTransferService.rejectDeposit(item);
          if (success) {
            refreshData();
          }
          return success;
        } catch (error) {
          console.error("Error in bankTransferService.rejectDeposit:", error);
          toast.error("Erreur lors du rejet via le service");
          return false;
        }
      }
    } catch (error) {
      console.error("Error rejecting deposit:", error);
      toast.error("Une erreur s'est produite lors du rejet");
      return false;
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReceipt = async (item: BankTransferItem) => {
    try {
      setProcessingId(item.id);
      console.log("Confirming receipt:", item);
      
      // First check if we need to update bank_transfers table
      const { data: bankTransfer } = await supabase
        .from("bank_transfers")
        .select("*")
        .eq("id", item.id)
        .maybeSingle();
      
      if (bankTransfer) {
        // Update in the bank_transfers table
        const { error } = await supabase
          .from("bank_transfers")
          .update({
            status: 'completed',
            processed: true,
            processed_at: new Date().toISOString()
          })
          .eq("id", item.id);
          
        if (error) {
          console.error("Error confirming bank transfer receipt:", error);
          toast.error("Erreur lors de la confirmation de la réception");
          return false;
        }
        
        toast.success("La réception du virement bancaire a été confirmée");
        refreshData();
        return true;
      } else {
        // Use the regular service
        try {
          const success = await bankTransferService.confirmReceipt(item);
          if (success) {
            refreshData();
          }
          return success;
        } catch (error) {
          console.error("Error in bankTransferService.confirmReceipt:", error);
          toast.error("Erreur lors de la confirmation via le service");
          return false;
        }
      }
    } catch (error) {
      console.error("Error confirming receipt:", error);
      toast.error("Une erreur s'est produite lors de la confirmation de réception");
      return false;
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
