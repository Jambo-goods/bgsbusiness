
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ActionButtonsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
}

export default function ActionButtons({ onDeposit, onWithdraw }: ActionButtonsProps) {
  const { toast } = useToast();

  const handleDeposit = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast({
          title: "Erreur",
          description: "Veuillez vous connecter pour effectuer un dépôt",
          variant: "destructive"
        });
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

      toast({
        title: "Dépôt réussi",
        description: `${depositAmount}€ ont été ajoutés à votre portefeuille`,
      });

      // Appel de la fonction de rappel
      onDeposit();

    } catch (error) {
      console.error("Erreur lors du dépôt:", error);
      toast({
        title: "Erreur de dépôt",
        description: "Une erreur s'est produite lors du dépôt des fonds",
        variant: "destructive"
      });
    }
  };

  const handleWithdraw = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast({
          title: "Erreur",
          description: "Veuillez vous connecter pour effectuer un retrait",
          variant: "destructive"
        });
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
        toast({
          title: "Solde insuffisant",
          description: "Vous n'avez pas assez de fonds pour effectuer ce retrait",
          variant: "destructive"
        });
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

      toast({
        title: "Retrait réussi",
        description: `${withdrawalAmount}€ ont été retirés de votre portefeuille`,
      });

      // Appel de la fonction de rappel
      onWithdraw();

    } catch (error) {
      console.error("Erreur lors du retrait:", error);
      toast({
        title: "Erreur de retrait",
        description: "Une erreur s'est produite lors du retrait des fonds",
        variant: "destructive"
      });
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
