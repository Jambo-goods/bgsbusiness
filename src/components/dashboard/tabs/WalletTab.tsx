
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import WalletBalance from "./wallet/WalletBalance";
import ActionButtons from "./wallet/ActionButtons";
import WalletHistory from "./wallet/WalletHistory";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BankTransferInstructions from "./wallet/BankTransferInstructions";
import WithdrawFundsForm from "./wallet/WithdrawFundsForm";

export default function WalletTab() {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get tab from URL or default to "overview"
  const getTabFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("tab") || "overview";
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromUrl());

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("tab", value);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };
  
  // Update tab state if URL changes
  useEffect(() => {
    const tabFromUrl = getTabFromUrl();
    if (tabFromUrl === "deposit" || tabFromUrl === "withdraw" || tabFromUrl === "overview") {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

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
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="deposit">Dépôt</TabsTrigger>
          <TabsTrigger value="withdraw">Retrait</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <ActionButtons onDeposit={handleDeposit} onWithdraw={handleWithdraw} refreshBalance={fetchWalletBalance} />
          <WalletHistory refreshBalance={fetchWalletBalance} />
        </TabsContent>
        
        <TabsContent value="deposit">
          <Card>
            <CardHeader>
              <CardTitle>Déposer des fonds par virement bancaire</CardTitle>
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
