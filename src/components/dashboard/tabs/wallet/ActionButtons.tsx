
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ActionButtonsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
  refreshBalance?: () => Promise<void>;
}

export default function ActionButtons({ onDeposit, onWithdraw, refreshBalance }: ActionButtonsProps) {
  const handleDeposit = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Veuillez vous connecter pour effectuer un dépôt");
        return;
      }

      // Ajout d'une transaction de dépôt (simulée pour le test)
      const depositAmount = 1000; // 1000€ pour test

      // Création de la transaction
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: session.session.user.id,
          amount: depositAmount,
          type: 'deposit',
          description: 'Dépôt de fonds'
        });

      if (transactionError) throw transactionError;

      // Mise à jour du solde du portefeuille
      const { error: walletError } = await supabase.rpc(
        'increment_wallet_balance',
        { user_id: session.session.user.id, increment_amount: depositAmount }
      );

      if (walletError) throw walletError;

      toast.success(`${depositAmount}€ ont été ajoutés à votre portefeuille`);

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
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Veuillez vous connecter pour effectuer un retrait");
        return;
      }

      // Récupération du solde actuel
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', session.session.user.id)
        .single();

      if (profileError) throw profileError;

      const withdrawalAmount = 500; // 500€ pour test

      // Vérification que le solde est suffisant
      if (profileData.wallet_balance < withdrawalAmount) {
        toast.error("Vous n'avez pas assez de fonds pour effectuer ce retrait");
        return;
      }

      // Création de la transaction
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: session.session.user.id,
          amount: withdrawalAmount,
          type: 'withdrawal',
          description: 'Retrait de fonds'
        });

      if (transactionError) throw transactionError;

      // Mise à jour du solde du portefeuille (soustraction)
      const { error: walletError } = await supabase.rpc(
        'increment_wallet_balance',
        { user_id: session.session.user.id, increment_amount: -withdrawalAmount }
      );

      if (walletError) throw walletError;

      toast.success(`${withdrawalAmount}€ ont été retirés de votre portefeuille`);

      // Appel de la fonction de rafraîchissement
      if (refreshBalance) await refreshBalance();
      onWithdraw();

    } catch (error) {
      console.error("Erreur lors du retrait:", error);
      toast.error("Une erreur s'est produite lors du retrait des fonds");
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      <Button 
        onClick={handleDeposit}
        className="bg-bgs-blue hover:bg-bgs-blue-light text-white"
      >
        <Upload className="h-4 w-4 mr-2" />
        Déposer des fonds
      </Button>
      
      <Button 
        onClick={handleWithdraw}
        variant="outline"
        className="border-bgs-blue text-bgs-blue hover:bg-bgs-blue/10"
      >
        <Download className="h-4 w-4 mr-2" />
        Retirer des fonds
      </Button>
    </div>
  );
}
