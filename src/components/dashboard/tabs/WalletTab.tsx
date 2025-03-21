
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import WalletBalance from "./wallet/WalletBalance";
import ActionButtons from "./wallet/ActionButtons";
import WalletHistory from "./wallet/WalletHistory";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BankTransferInstructions from "./wallet/BankTransferInstructions";
import WithdrawFundsForm from "./wallet/WithdrawFundsForm";
import RefreshBalanceButton from "./wallet/RefreshBalanceButton";

export default function WalletTab() {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchWalletBalance();
    
    // Create polling for balance updates
    const balanceInterval = setInterval(() => {
      fetchWalletBalance(false); // Silent refresh (no loading indicator)
    }, 15000); // Check every 15 seconds (reduced from 30s)
    
    // Set up realtime listener for wallet balance
    const profilesChannel = supabase
      .channel('wallet-balance-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        async (payload) => {
          const { data: session } = await supabase.auth.getSession();
          
          // Only update if this is the current user's profile
          if (session.session?.user.id === payload.new.id && 
              payload.new.wallet_balance !== payload.old.wallet_balance) {
            console.log('Wallet balance updated via realtime:', payload.new.wallet_balance);
            setBalance(payload.new.wallet_balance);
          }
        }
      )
      .subscribe();
    
    // Set up realtime listener for wallet transactions
    const transactionsChannel = supabase
      .channel('wallet-transactions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wallet_transactions' },
        (payload) => {
          console.log('Wallet transaction change detected:', payload);
          fetchWalletBalance(false); // Refresh balance without loading state
        }
      )
      .subscribe();
    
    // Set up realtime listener for bank transfers
    const transfersChannel = supabase
      .channel('bank-transfers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bank_transfers' },
        (payload) => {
          console.log('Bank transfer change detected:', payload);
          fetchWalletBalance(false); // Refresh balance without loading state
        }
      )
      .subscribe();
    
    return () => {
      clearInterval(balanceInterval);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(transfersChannel);
    };
  }, []);

  const fetchWalletBalance = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Veuillez vous connecter pour accéder à votre portefeuille");
        setIsLoading(false);
        return;
      }
      
      console.log('Récupération du solde pour l\'utilisateur:', session.session.user.id);
      
      // Fetch wallet balance from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', session.session.user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Erreur lors de la récupération du solde:", error);
        toast.error("Impossible de récupérer votre solde");
      } else {
        console.log('Wallet balance fetch result:', data);
        if (data) {
          setBalance(data.wallet_balance || 0);
          console.log('Wallet balance updated:', data.wallet_balance);
        } else {
          console.warn('No profile data found');
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du solde:", error);
      toast.error("Impossible de récupérer votre solde");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = () => {
    // Switch to deposit tab to show bank transfer instructions
    setActiveTab("deposit");
  };

  const handleWithdraw = async () => {
    console.log('handleWithdraw called');
    setActiveTab("withdraw");
    await fetchWalletBalance();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <WalletBalance 
          balance={balance} 
          isLoading={isLoading} 
          onTabChange={handleTabChange}
        />
        <RefreshBalanceButton 
          onRefresh={() => fetchWalletBalance(true)}
          disabled={isLoading}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="deposit">Instructions de virement</TabsTrigger>
          <TabsTrigger value="withdraw">Retrait</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <ActionButtons 
            onDeposit={handleDeposit} 
            onWithdraw={handleWithdraw} 
            refreshBalance={fetchWalletBalance} 
          />
          <WalletHistory refreshBalance={fetchWalletBalance} />
        </TabsContent>
        
        <TabsContent value="deposit">
          <Card>
            <CardHeader>
              <CardTitle>Instructions pour le virement bancaire</CardTitle>
            </CardHeader>
            <CardContent>
              <BankTransferInstructions />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle>Retirer des fonds</CardTitle>
            </CardHeader>
            <CardContent>
              <WithdrawFundsForm balance={balance} onWithdraw={handleWithdraw} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
