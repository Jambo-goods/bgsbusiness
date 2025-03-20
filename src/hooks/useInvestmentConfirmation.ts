
// Cette version est compatible avec celle du dossier admin
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BankTransferItem {
  id: string;
  user_id?: string;
  amount?: number;
  status?: string;
  reference?: string;
  description?: string;
  processed?: boolean;
  processed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  profile?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export function useInvestmentConfirmation() {
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const updateBankTransfer = async (transferId: string, newStatus: string, processedDate: string | null = null) => {
    try {
      if (!transferId) {
        console.error("Transfert invalide:", transferId);
        toast.error("Erreur: données de transfert invalides");
        return { success: false };
      }

      setProcessingId(transferId);
      
      // Mise à jour du transfert
      const isProcessed = newStatus === 'received' || processedDate !== null;
      
      const { data: updateResult, error: updateError } = await supabase
        .from('bank_transfers')
        .update({
          status: newStatus,
          processed: isProcessed,
          processed_at: isProcessed ? (processedDate || new Date().toISOString()) : null,
          notes: `Mise à jour le ${new Date().toLocaleDateString('fr-FR')}`
        })
        .eq('id', transferId)
        .select();
      
      if (updateError) {
        console.error("Erreur de mise à jour:", updateError);
        return {
          success: false,
          message: `Erreur de mise à jour: ${updateError.message}`,
          error: updateError
        };
      }
      
      console.log("Mise à jour réussie:", updateResult);
      return { success: true, data: updateResult };
      
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      return {
        success: false,
        message: `Erreur: ${error.message || 'Erreur inconnue'}`,
        error
      };
    } finally {
      setTimeout(() => setProcessingId(null), 500);
    }
  };

  const confirmInvestment = async (transfer: BankTransferItem) => {
    return updateBankTransfer(transfer.id, 'received');
  };

  const rejectInvestment = async (transfer: BankTransferItem) => {
    return updateBankTransfer(transfer.id, 'rejected');
  };

  return {
    processingId,
    confirmInvestment,
    rejectInvestment
  };
}
