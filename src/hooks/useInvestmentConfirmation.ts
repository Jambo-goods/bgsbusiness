
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

      console.log(`Traitement de la confirmation pour le montant: ${amount}€`);

      // First try to find the bank transfer in the bank_transfers table
      const { data: transfer, error: transferError } = await supabase
        .from('bank_transfers')
        .select('*')
        .eq('user_id', userId)
        .eq('amount', amount)
        .eq('status', 'pending')
        .maybeSingle();

      if (transferError) {
        console.error("Erreur lors de la récupération du virement bancaire:", transferError);
        setError("Erreur lors de la vérification du virement.");
        toast.error("Erreur lors de la vérification du virement.");
        return;
      }

      // If not found in bank_transfers, check wallet_transactions
      if (!transfer) {
        console.log("Aucun transfert bancaire trouvé, vérification des transactions de portefeuille...");
        const { data: walletTransfer, error: walletError } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', userId)
          .eq('amount', amount)
          .eq('status', 'pending')
          .maybeSingle();

        if (walletError) {
          console.error("Erreur lors de la récupération de la transaction:", walletError);
          setError("Erreur lors de la vérification de la transaction.");
          toast.error("Erreur lors de la vérification de la transaction.");
          return;
        }

        if (!walletTransfer) {
          console.error("Aucun virement ou transaction trouvé avec ce montant:", amount);
          setError("Aucun virement bancaire en attente trouvé avec ce montant.");
          toast.error("Aucun virement bancaire en attente trouvé avec ce montant.");
          return;
        }

        console.log("Transaction de portefeuille trouvée:", walletTransfer);

        // Update the wallet transaction
        const { error: updateError } = await supabase
          .from('wallet_transactions')
          .update({ 
            status: 'completed',
            receipt_confirmed: true
          })
          .eq('id', walletTransfer.id);

        if (updateError) {
          console.error("Erreur lors de la mise à jour de la transaction:", updateError);
          setError("Erreur lors de la confirmation de la transaction.");
          toast.error("Erreur lors de la confirmation de la transaction.");
          return;
        }

        console.log("Transaction mise à jour avec succès, mise à jour du solde...");

        // Update the user's wallet balance directly - IMPORTANT
        const { error: walletError2 } = await supabase.rpc('increment_wallet_balance', {
          user_id: userId,
          increment_amount: amount
        });

        if (walletError2) {
          console.error("Erreur lors de la mise à jour du solde:", walletError2);
          setError("Erreur lors de la mise à jour du solde.");
          toast.error("Erreur lors de la mise à jour du solde.");
          return;
        }

        console.log(`Solde mis à jour avec succès, ajout de ${amount}€`);

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
        return;
      }

      console.log("Transfert bancaire trouvé:", transfer);

      // If we found a bank_transfer, update it using the bankTransferService
      const result = await bankTransferService.updateBankTransfer(transfer.id, 'received');

      if (!result.success) {
        console.error("Erreur lors de la mise à jour du transfert:", result);
        setError("Erreur lors de la confirmation du virement.");
        toast.error("Erreur lors de la confirmation du virement.");
        return;
      }

      console.log("Transfert mis à jour avec succès, mise à jour du solde...");

      // Force direct update of the user's wallet balance to ensure it updates immediately
      const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
        user_id: userId,
        increment_amount: amount
      });

      if (balanceError) {
        console.error("Erreur lors de la mise à jour du solde:", balanceError);
        toast.error("Erreur lors de la mise à jour du solde, mais le transfert a été marqué comme reçu.");
        // We continue anyway as the transfer was marked as received
      } else {
        console.log(`Solde mis à jour avec succès, ajout de ${amount}€`);
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
