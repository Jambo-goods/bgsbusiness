
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
    
    // Set up realtime subscription for profile changes
    const profileChannel = supabase
      .channel('wallet_balance_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        console.log('Profile updated, refreshing wallet balance...');
        fetchWalletBalance();
      })
      .subscribe();
      
    // Set up realtime subscription for wallet transactions
    const transactionsChannel = supabase
      .channel('wallet_transaction_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wallet_transactions'
      }, () => {
        console.log('Wallet transaction detected, refreshing balance...');
        fetchWalletBalance();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(transactionsChannel);
    };
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
        console.log('Wallet balance updated:', data.wallet_balance);
        setBalance(data.wallet_balance || 0);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du solde:", error);
      toast.error("Impossible de récupérer votre solde");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    await fetchWalletBalance();
  };

  const handleWithdraw = async () => {
    await fetchWalletBalance();
  };

  return (
    <div className="space-y-6">
      <WalletBalance balance={balance} isLoading={isLoading} />
      <ActionButtons onDeposit={handleDeposit} onWithdraw={handleWithdraw} refreshBalance={fetchWalletBalance} />
      <WalletHistory refreshBalance={fetchWalletBalance} />
    </div>
  );
}
