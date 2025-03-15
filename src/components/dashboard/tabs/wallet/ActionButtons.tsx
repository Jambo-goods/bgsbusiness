import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notificationService } from "@/services/notifications";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

interface ActionButtonsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
  refreshBalance?: () => Promise<void>;
}

export default function ActionButtons({
  onDeposit,
  onWithdraw,
  refreshBalance
}: ActionButtonsProps) {
  const handleDeposit = async () => {
    try {
      const {
        data: session
      } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Veuillez vous connecter pour effectuer un dépôt");
        return;
      }

      console.log("Creating simulated deposit transaction");
      
      // Ajout d'une transaction de dépôt (simulée pour le test)
      const depositAmount = 1000; // 1000€ pour test

      // Création de la transaction
      const {
        data: transactionData,
        error: transactionError
      } = await supabase.from('wallet_transactions').insert({
        user_id: session.session.user.id,
        amount: depositAmount,
        type: 'deposit',
        description: 'Dépôt de fonds (test)',
        status: 'completed'
      }).select().single();
      
      if (transactionError) throw transactionError;
      
      console.log("Transaction created:", transactionData);

      // Mise à jour du solde du portefeuille
      const {
        error: walletError
      } = await supabase.rpc('increment_wallet_balance', {
        user_id: session.session.user.id,
        increment_amount: depositAmount
      });
      
      if (walletError) throw walletError;
      
      console.log("Wallet balance updated");
      
      // Create notification for deposit success
      await notificationService.depositSuccess(depositAmount);
      console.log("Deposit notification created");
      
      toast.success("Dépôt effectué avec succès", {
        description: `${depositAmount}€ ont été ajoutés à votre portefeuille`,
      });
      
      // Appel de la fonction de rafraîchissement
      if (refreshBalance) await refreshBalance();
      onDeposit();
    } catch (error) {
      console.error("Erreur lors du dépôt:", error);
      toast.error("Une erreur s'est produite lors du dépôt des fonds");
    }
  };
  
  const handleWithdraw = async () => {
    try {
      const {
        data: session
      } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Veuillez vous connecter pour effectuer un retrait");
        return;
      }

      // Récupération du solde actuel
      const {
        data: profileData,
        error: profileError
      } = await supabase.from('profiles').select('wallet_balance').eq('id', session.session.user.id).single();
      
      if (profileError) throw profileError;
      
      const withdrawalAmount = 500; // 500€ pour test
      
      console.log("Current balance:", profileData.wallet_balance, "Withdrawal amount:", withdrawalAmount);

      // Vérification que le solde est suffisant
      if (profileData.wallet_balance < withdrawalAmount) {
        toast.error("Vous n'avez pas assez de fonds pour effectuer ce retrait");
        await notificationService.insufficientFunds();
        return;
      }

      // Création de la transaction
      const {
        data: transactionData,
        error: transactionError
      } = await supabase.from('wallet_transactions').insert({
        user_id: session.session.user.id,
        amount: withdrawalAmount,
        type: 'withdrawal',
        description: 'Retrait de fonds (test)',
        status: 'completed'
      }).select().single();
      
      if (transactionError) throw transactionError;
      
      console.log("Withdrawal transaction created:", transactionData);

      // Mise à jour du solde du portefeuille (soustraction)
      const {
        error: walletError
      } = await supabase.rpc('increment_wallet_balance', {
        user_id: session.session.user.id,
        increment_amount: -withdrawalAmount
      });
      
      if (walletError) throw walletError;
      
      console.log("Wallet balance updated after withdrawal");
      
      // Create notification for withdrawal
      await notificationService.withdrawalValidated(withdrawalAmount);
      console.log("Withdrawal notification created");
      
      toast.success("Retrait effectué avec succès", {
        description: `${withdrawalAmount}€ ont été retirés de votre portefeuille`,
      });
      
      // Appel de la fonction de rafraîchissement
      if (refreshBalance) await refreshBalance();
      onWithdraw();
    } catch (error) {
      console.error("Erreur lors du retrait:", error);
      toast.error("Une erreur s'est produite lors du retrait des fonds");
    }
  };
  
  return (
    <div className="flex justify-end mb-6">
      {/* Withdraw button removed as requested */}
    </div>
  );
}
