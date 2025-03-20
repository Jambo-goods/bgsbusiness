import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { bankTransferService } from '@/components/admin/dashboard/services/bankTransferService';

export const useInvestmentConfirmation = (projectId: string, userId: string) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBankTransferConfirmation = async (amount: number) => {
    setIsConfirming(true);
    setIsSuccess(false);
    setError(null);

    try {
      if (!amount || amount <= 0) {
        setError("Montant invalide.");
        toast.error("Montant invalide.");
        return;
      }

      // Fetch the bank transfer details
      const { data: transfer, error: transferError } = await supabase
        .from('bank_transfers')
        .select('*')
        .eq('user_id', userId)
        .eq('amount', amount)
        .eq('status', 'pending')
        .single();

      if (transferError) {
        console.error("Erreur lors de la récupération du virement bancaire:", transferError);
        setError("Erreur lors de la vérification du virement.");
        toast.error("Erreur lors de la vérification du virement.");
        return;
      }

      if (!transfer) {
        setError("Aucun virement bancaire en attente trouvé avec ce montant.");
        toast.error("Aucun virement bancaire en attente trouvé avec ce montant.");
        return;
      }

      // Update the bank transfer status to 'received'
      const result = await bankTransferService.updateBankTransfer(transfer.id, 'received');

      if (!result.success) {
        setError("Erreur lors de la confirmation du virement.");
        toast.error("Erreur lors de la confirmation du virement.");
        return;
      }

      // Update the investment status to 'active'
      const { error: investmentError } = await supabase
        .from('investments')
        .update({ status: 'active' })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (investmentError) {
        console.error("Erreur lors de la mise à jour de l'investissement:", investmentError);
        setError("Erreur lors de l'activation de l'investissement.");
        toast.error("Erreur lors de l'activation de l'investissement.");
        return;
      }

      setIsSuccess(true);
      toast.success("Investissement confirmé avec succès!");
    } catch (err: any) {
      console.error("Erreur lors de la confirmation de l'investissement:", err);
      setError("Erreur inattendue lors de la confirmation.");
      toast.error("Erreur inattendue lors de la confirmation.");
    } finally {
      setIsConfirming(false);
    }
  };

  return {
    isConfirming,
    isSuccess,
    error,
    handleBankTransferConfirmation
  };
};
