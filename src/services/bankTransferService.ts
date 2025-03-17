
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BankTransfer {
  id: string;
  reference: string;
  amount: number;
  created_at: string;
  user_id: string;
  status: string;
  notes?: string | null;
  confirmed_at?: string | null;
  processed_at?: string | null;
}

export const createBankTransfer = async (
  userId: string,
  amount: number,
  reference: string,
  notes?: string
) => {
  try {
    const { data, error } = await supabase
      .from("bank_transfers")
      .insert({
        user_id: userId,
        amount,
        reference,
        status: "pending",
        notes
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Error creating bank transfer:", error);
    return { success: false, error: error.message };
  }
};

export const updateBankTransferStatus = async (
  transferId: string,
  status: string,
  notes?: string
) => {
  try {
    const updates: any = { 
      status, 
      notes: notes || null
    };
    
    // Add confirmed_at timestamp if status is 'received'
    if (status === "received" || status === "reçu") {
      updates.confirmed_at = new Date().toISOString();
    }
    
    // Add processed_at timestamp if status is 'processed'
    if (status === "processed") {
      updates.processed_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from("bank_transfers")
      .update(updates)
      .eq("id", transferId)
      .select()
      .single();

    if (error) throw error;
    
    toast.success(`Statut du virement mis à jour : ${status}`);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error updating bank transfer status:", error);
    toast.error(`Erreur lors de la mise à jour : ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const incrementWalletBalance = async (userId: string, amount: number) => {
  try {
    const { data, error } = await supabase
      .rpc('increment_wallet_balance', { 
        user_id: userId, 
        increment_amount: amount 
      });

    if (error) throw error;
    
    toast.success(`Solde mis à jour : +${amount}€`);
    return { success: true };
  } catch (error: any) {
    console.error("Error incrementing wallet balance:", error);
    toast.error(`Erreur lors de la mise à jour du solde : ${error.message}`);
    return { success: false, error: error.message };
  }
};
