
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

export default function WalletTab() {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchWalletBalance();
    
    // Create polling for balance updates
    const balanceInterval = setInterval(() => {
      fetchWalletBalance(false); // Silent refresh (no loading indicator)
    }, 30000); // Check every 30 seconds
    
    // Set up realtime listener for scheduled payments to update balance
    const scheduledPaymentsChannel = supabase
      .channel('wallet-scheduled-payments')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'scheduled_payments', filter: 'status=eq.paid' },
        (payload) => {
          console.log('Scheduled payment paid:', payload);
          fetchWalletBalance(false); // Refresh balance without loading state
          
          toast.success("Rendement reçu !", {
            description: "Un paiement de rendement a été ajouté à votre portefeuille.",
          });
        }
      )
      .subscribe();
      
    // Set up realtime listener for wallet balance
    const profilesChannel = supabase
      .channel('wallet-balance-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        async (payload) => {
          const { data: session } = await supabase.auth.getSession();
          
          // Only update if this is the current user's profile
          if (session.session?.user.id === payload.new.id && payload.new.wallet_balance !== payload.old.wallet_balance) {
            console.log('Wallet balance updated:', payload.new.wallet_balance);
            setBalance(payload.new.wallet_balance);
          }
        }
      )
      .subscribe();
    
    return () => {
      clearInterval(balanceInterval);
      supabase.removeChannel(scheduledPaymentsChannel);
      supabase.removeChannel(profilesChannel);
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
        console.log('Wallet balance updated:', data?.wallet_balance);
        setBalance(data?.wallet_balance || 0);
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      <WalletBalance 
        balance={balance} 
        isLoading={isLoading} 
        onTabChange={handleTabChange}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
