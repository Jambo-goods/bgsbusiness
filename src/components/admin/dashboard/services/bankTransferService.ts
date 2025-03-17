
import { supabase } from "@/integrations/supabase/client";
import { BankTransferItem } from "../types/bankTransfer";
import { toast } from "sonner";

export const bankTransferService = {
  confirmDeposit: async (item: BankTransferItem, amount: number): Promise<boolean> => {
    try {
      console.log(`Confirmation du dépôt pour l'ID: ${item.id}, montant: ${amount}`);
      
      // Déterminer quelle table mettre à jour en fonction de la source
      if (item.source === "bank_transfers") {
        const { error } = await supabase
          .from("bank_transfers")
          .update({
            status: "completed",
            processed: true,
            processed_at: new Date().toISOString(),
            amount: amount
          })
          .eq("id", item.id);
        
        if (error) {
          console.error("Erreur lors de la mise à jour du virement:", error);
          throw error;
        }
        
        // Mettre à jour le solde du portefeuille de l'utilisateur
        await supabase.rpc("increment_wallet_balance", {
          user_id: item.user_id,
          increment_amount: amount
        });
      } else if (item.source === "wallet_transactions") {
        const { error } = await supabase
          .from("wallet_transactions")
          .update({
            status: "completed",
            receipt_confirmed: true,
            amount: amount
          })
          .eq("id", item.id);
        
        if (error) {
          console.error("Erreur lors de la mise à jour de la transaction:", error);
          throw error;
        }
        
        // Mettre à jour le solde du portefeuille de l'utilisateur
        await supabase.rpc("increment_wallet_balance", {
          user_id: item.user_id,
          increment_amount: amount
        });
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la confirmation du dépôt:", error);
      toast.error("Une erreur est survenue lors du traitement");
      return false;
    }
  },

  rejectDeposit: async (item: BankTransferItem): Promise<boolean> => {
    try {
      console.log(`Rejet du dépôt pour l'ID: ${item.id}`);
      
      // Déterminer quelle table mettre à jour en fonction de la source
      if (item.source === "bank_transfers") {
        const { error } = await supabase
          .from("bank_transfers")
          .update({
            status: "rejected",
            processed: true,
            processed_at: new Date().toISOString()
          })
          .eq("id", item.id);
        
        if (error) {
          console.error("Erreur lors du rejet du virement:", error);
          throw error;
        }
      } else if (item.source === "wallet_transactions") {
        const { error } = await supabase
          .from("wallet_transactions")
          .update({
            status: "rejected"
          })
          .eq("id", item.id);
        
        if (error) {
          console.error("Erreur lors du rejet de la transaction:", error);
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors du rejet du dépôt:", error);
      toast.error("Une erreur est survenue lors du traitement");
      return false;
    }
  },

  confirmReceipt: async (item: BankTransferItem): Promise<boolean> => {
    try {
      console.log(`Confirmation de la réception pour l'ID: ${item.id}`);
      
      // Déterminer quelle table mettre à jour en fonction de la source
      if (item.source === "bank_transfers") {
        const { error } = await supabase
          .from("bank_transfers")
          .update({
            status: "received",
            processed: false
          })
          .eq("id", item.id);
        
        if (error) {
          console.error("Erreur lors de la confirmation de la réception:", error);
          throw error;
        }
      } else if (item.source === "wallet_transactions") {
        const { error } = await supabase
          .from("wallet_transactions")
          .update({
            receipt_confirmed: true
          })
          .eq("id", item.id);
        
        if (error) {
          console.error("Erreur lors de la confirmation de la réception de la transaction:", error);
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la confirmation de la réception:", error);
      toast.error("Une erreur est survenue lors du traitement");
      return false;
    }
  }
};
