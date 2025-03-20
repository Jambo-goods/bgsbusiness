
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
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export function useInvestmentConfirmation() {
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const updateBankTransfer = async (transferId: string, newStatus: string, processedDate: string | null = null) => {
    try {
      if (!transferId || typeof transferId !== 'string' || transferId.trim() === '') {
        console.error("Transfert invalide pour l'investissement:", transferId);
        toast.error("Erreur: données de transfert invalides");
        return { success: false };
      }

      setProcessingId(transferId);
      
      // Vérifier si le transfert existe
      const { data: existingTransfer, error: checkError } = await supabase
        .from('bank_transfers')
        .select('id, status, user_id')
        .eq('id', transferId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Erreur lors de la vérification de l'investissement:", checkError);
        return {
          success: false,
          message: `Erreur de vérification: ${checkError.message}`,
          error: checkError
        };
      }
      
      if (!existingTransfer) {
        console.error("Transfert d'investissement non trouvé:", transferId);
        return {
          success: false,
          message: "Le transfert demandé n'existe pas",
          error: new Error("Transfer not found")
        };
      }
      
      // Ajouter un petit délai pour éviter les conflits
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Mise à jour du transfert
      const isProcessed = newStatus === 'received' || processedDate !== null;
      
      const { data: updateResult, error: updateError } = await supabase
        .from('bank_transfers')
        .update({
          status: newStatus,
          processed: isProcessed,
          processed_at: isProcessed ? (processedDate || new Date().toISOString()) : null,
          notes: `Mise à jour le ${new Date().toLocaleDateString('fr-FR')} (investissement)`
        })
        .eq('id', transferId)
        .select();
      
      if (updateError) {
        console.error("Erreur de mise à jour de l'investissement:", updateError);
        return {
          success: false,
          message: `Erreur de mise à jour: ${updateError.message}`,
          error: updateError
        };
      }
      
      console.log("Mise à jour d'investissement réussie:", updateResult);
      return { success: true, data: updateResult };
      
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'investissement:", error);
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
    if (!transfer || !transfer.id) {
      console.error("Données de transfert invalides pour confirmation d'investissement:", transfer);
      toast.error("Erreur: données de transfert invalides");
      return { success: false };
    }
    
    console.log("Confirmation d'investissement pour:", transfer.id);
    return updateBankTransfer(transfer.id, 'received');
  };

  const rejectInvestment = async (transfer: BankTransferItem) => {
    if (!transfer || !transfer.id) {
      console.error("Données de transfert invalides pour rejet d'investissement:", transfer);
      toast.error("Erreur: données de transfert invalides");
      return { success: false };
    }
    
    console.log("Rejet d'investissement pour:", transfer.id);
    return updateBankTransfer(transfer.id, 'rejected');
  };

  return {
    processingId,
    confirmInvestment,
    rejectInvestment
  };
}
