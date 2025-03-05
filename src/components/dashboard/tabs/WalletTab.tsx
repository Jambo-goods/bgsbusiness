
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import WalletBalance from "./wallet/WalletBalance";
import ActionButtons from "./wallet/ActionButtons";
import WalletHistory from "./wallet/WalletHistory";
import { supabase } from "@/integrations/supabase/client";

export default function WalletTab() {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour récupérer le solde du portefeuille
  const fetchWalletBalance = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Veuillez vous connecter pour accéder à votre portefeuille");
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', session.session.user.id)
        .single();
        
      if (error) throw error;
      
      setBalance(data.wallet_balance || 0);
    } catch (err) {
      console.error("Erreur lors de la récupération du solde:", err);
      toast.error("Erreur lors du chargement du solde du portefeuille");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  // Gestionnaires d'événements pour les dépôts et retraits
  const handleDeposit = () => {
    fetchWalletBalance(); // Rafraîchir le solde après un dépôt
  };

  const handleWithdraw = () => {
    fetchWalletBalance(); // Rafraîchir le solde après un retrait
  };

  return (
    <div className="space-y-6">
      <WalletBalance balance={balance} isLoading={isLoading} />
      <ActionButtons onDeposit={handleDeposit} onWithdraw={handleWithdraw} />
      <WalletHistory />
    </div>
  );
}
