
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
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Veuillez vous connecter pour accéder à votre portefeuille");
        return;
      }
      
      // Fetch wallet balance from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', session.session.user.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setBalance(data.wallet_balance || 0);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du solde:", error);
      toast.error("Impossible de récupérer votre solde");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = () => {
    // This is a placeholder for actual deposit functionality
    toast.success("Cette fonctionnalité sera bientôt disponible");
    // After successful deposit, refresh the balance
    fetchWalletBalance();
  };

  const handleWithdraw = () => {
    // This is a placeholder for actual withdrawal functionality
    toast.info("Cette fonctionnalité sera bientôt disponible");
    // After successful withdrawal, refresh the balance
    fetchWalletBalance();
  };

  return (
    <div className="space-y-6">
      <WalletBalance balance={balance} isLoading={isLoading} />
      <ActionButtons onDeposit={handleDeposit} onWithdraw={handleWithdraw} />
      <WalletHistory refreshBalance={fetchWalletBalance} />
    </div>
  );
}
