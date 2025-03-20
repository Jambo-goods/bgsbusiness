
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpFromLine, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { notificationService } from '@/services/notifications';
import { supabase } from '@/integrations/supabase/client';

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

      // Vérification que le solde est suffisant
      if (profileData.wallet_balance < withdrawalAmount) {
        toast.error("Vous n'avez pas assez de fonds pour effectuer ce retrait");
        await notificationService.insufficientFunds();
        return;
      }

      // Création de la transaction
      const {
        error: transactionError
      } = await supabase.from('wallet_transactions').insert({
        user_id: session.session.user.id,
        amount: withdrawalAmount,
        type: 'withdrawal',
        description: 'Retrait de fonds'
      });
      if (transactionError) throw transactionError;

      // Mise à jour du solde du portefeuille (soustraction)
      const {
        error: walletError
      } = await supabase.rpc('increment_wallet_balance', {
        user_id: session.session.user.id,
        increment_amount: -withdrawalAmount
      });
      if (walletError) throw walletError;

      // Create notification for withdrawal
      await notificationService.withdrawalValidated(withdrawalAmount);

      // Appel de la fonction de rafraîchissement
      if (refreshBalance) await refreshBalance();
      onWithdraw();
      toast.success(`Retrait de ${withdrawalAmount}€ effectué avec succès`);
    } catch (error) {
      console.error("Erreur lors du retrait:", error);
      toast.error("Une erreur s'est produite lors du retrait des fonds");
    }
  };
  
  const handleRefresh = async () => {
    if (refreshBalance) {
      try {
        await refreshBalance();
        toast.info("Actualisation des données...");
      } catch (error) {
        console.error("Erreur lors de l'actualisation:", error);
        toast.error("Erreur lors de l'actualisation des données");
      }
    }
  };
  
  return (
    <div className="flex items-center gap-2 mt-4">
      <Button 
        variant="outline" 
        className="flex items-center gap-2 border-bgs-blue text-bgs-blue hover:bg-bgs-blue/10"
        onClick={onDeposit}
      >
        Voir les instructions de virement
      </Button>
      
      <Button onClick={handleWithdraw} variant="outline" className="flex items-center gap-2">
        <ArrowUpFromLine className="w-4 h-4" />
        Retirer
      </Button>
      
      <Button
        onClick={handleRefresh}
        variant="ghost"
        size="icon"
        className="ml-auto"
        title="Actualiser le solde"
      >
        <RotateCw className="w-4 h-4" />
      </Button>
    </div>
  );
}
