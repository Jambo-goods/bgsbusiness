
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Base service with common utilities and error handling
export const baseTransferService = {
  async validateTransferId(transferId: string): Promise<boolean> {
    if (!transferId || transferId.trim() === '') {
      console.error("ID de transfert invalide");
      return false;
    }
    return true;
  },

  async findBankTransfer(transferId: string) {
    const { data, error } = await supabase
      .from("bank_transfers")
      .select("user_id, status, processed")
      .eq("id", transferId)
      .maybeSingle();
      
    if (error) {
      console.error("Erreur lors de la récupération du virement:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },
  
  async findWalletTransaction(transferId: string) {
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("user_id, status, receipt_confirmed")
      .eq("id", transferId)
      .maybeSingle();
      
    if (error) {
      console.error("Erreur lors de la récupération de la transaction:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },
  
  async recalculateWalletBalance(userId: string) {
    try {
      const { error } = await supabase.rpc('recalculate_wallet_balance', {
        user_uuid: userId
      });
      
      if (error) {
        console.error("Erreur de recalcul du solde:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du portefeuille:", error);
      return false;
    }
  }
};
