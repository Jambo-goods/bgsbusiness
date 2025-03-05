
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import WalletBalance from "./wallet/WalletBalance";
import ActionButtons from "./wallet/ActionButtons";
import WalletHistory from "./wallet/WalletHistory";
import { supabase } from "@/integrations/supabase/client";

export default function WalletTab() {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger le solde réel de l'utilisateur depuis Supabase
    async function loadWalletBalance() {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Vérifier si l'utilisateur a un portefeuille
          const { data: walletData } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', user.id)
            .single();
          
          if (walletData) {
            setBalance(walletData.wallet_balance || 0);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du solde:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadWalletBalance();
  }, []);

  const handleDeposit = () => {
    // Fonction de dépôt - sera implémentée plus tard
    toast.success("Cette fonctionnalité sera bientôt disponible");
  };

  const handleWithdraw = () => {
    // Fonction de retrait - sera implémentée plus tard
    toast.info("Cette fonctionnalité sera bientôt disponible");
  };

  return (
    <div className="space-y-6">
      <WalletBalance balance={balance} />
      <ActionButtons onDeposit={handleDeposit} onWithdraw={handleWithdraw} />
      <WalletHistory />
    </div>
  );
}
