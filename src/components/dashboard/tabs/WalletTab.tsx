
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import WalletBalance from "./wallet/WalletBalance";
import ActionButtons from "./wallet/ActionButtons";
import WalletHistory from "./wallet/WalletHistory";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function WalletTab() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { toast: uiToast } = useToast();

  // Fetch wallet balance and transactions
  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("Utilisateur non authentifié");
        return;
      }
      
      // Fetch user profile to get wallet balance
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error("Erreur lors de la récupération du profil:", profileError);
      } else if (profileData) {
        setBalance(profileData.wallet_balance || 0);
      }
      
      // Fetch wallet transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (transactionsError) {
        console.error("Erreur lors de la récupération des transactions:", transactionsError);
      } else {
        setTransactions(transactionsData || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données du portefeuille:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleDeposit = async () => {
    try {
      setIsDepositing(true);
      
      // Get deposit amount (in a real app, this would come from a form)
      const amount = 1000; // Example: fixed deposit of 1000€
      
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour effectuer un dépôt");
        return;
      }
      
      // Create a transaction
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          amount: amount,
          type: 'deposit',
          description: 'Dépôt de fonds',
        });
      
      if (transactionError) {
        console.error("Erreur lors de la création de la transaction:", transactionError);
        toast.error("Impossible de créer la transaction");
        return;
      }
      
      // Update user's wallet balance
      const { error: updateError } = await supabase.rpc(
        'increment_wallet_balance',
        { user_id: user.id, increment_amount: amount }
      );
      
      if (updateError) {
        console.error("Erreur lors de la mise à jour du solde:", updateError);
        toast.error("Impossible de mettre à jour votre solde");
        return;
      }
      
      // Success! Refresh wallet data
      await fetchWalletData();
      
      toast.success(`Dépôt de ${amount}€ effectué avec succès`);
    } catch (error) {
      console.error("Erreur lors du dépôt:", error);
      toast.error("Une erreur est survenue lors du dépôt");
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);
      
      // Get withdrawal amount (in a real app, this would come from a form)
      const amount = 500; // Example: fixed withdrawal of 500€
      
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour effectuer un retrait");
        return;
      }
      
      // Check if user has enough balance
      if (balance < amount) {
        toast.error("Solde insuffisant pour effectuer ce retrait");
        return;
      }
      
      // Create a transaction
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          amount: -amount, // negative amount for withdrawal
          type: 'withdrawal',
          description: 'Retrait de fonds',
        });
      
      if (transactionError) {
        console.error("Erreur lors de la création de la transaction:", transactionError);
        toast.error("Impossible de créer la transaction");
        return;
      }
      
      // Update user's wallet balance
      const { error: updateError } = await supabase.rpc(
        'increment_wallet_balance',
        { user_id: user.id, increment_amount: -amount }
      );
      
      if (updateError) {
        console.error("Erreur lors de la mise à jour du solde:", updateError);
        toast.error("Impossible de mettre à jour votre solde");
        return;
      }
      
      // Success! Refresh wallet data
      await fetchWalletData();
      
      toast.success(`Retrait de ${amount}€ effectué avec succès`);
    } catch (error) {
      console.error("Erreur lors du retrait:", error);
      toast.error("Une erreur est survenue lors du retrait");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      <WalletBalance balance={balance} />
      <ActionButtons 
        onDeposit={handleDeposit} 
        onWithdraw={handleWithdraw} 
        isDepositing={isDepositing}
        isWithdrawing={isWithdrawing}
      />
      <WalletHistory transactions={transactions} isLoading={loading} />
    </div>
  );
}
