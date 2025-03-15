
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import WalletBalance from "./wallet/WalletBalance";
import ActionButtons from "./wallet/ActionButtons";
import WalletHistory from "./wallet/WalletHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BankTransferInstructions from "./wallet/BankTransferInstructions";
import WithdrawFundsForm from "./wallet/WithdrawFundsForm";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { supabase } from "@/integrations/supabase/client";
import { Wallet } from "lucide-react";

export default function WalletTab() {
  const [activeTab, setActiveTab] = useState("overview");
  const { walletBalance, isLoadingBalance, refreshBalance, recalculateBalance } = useWalletBalance();

  // Auto-recalculate when tab loads
  useEffect(() => {
    console.log("Wallet tab mounted, recalculating balance...");
    recalculateBalance();
  }, [recalculateBalance]);

  // Setup wallet transaction subscriptions
  useEffect(() => {
    console.log("Setting up wallet tab subscriptions");
    
    const setupBankTransferSubscriptions = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) return;
      
      console.log("Setting up bank transfer subscriptions for user:", userId);
      
      // Subscribe to bank_transfers table changes
      const bankTransfersChannel = supabase
        .channel('wallet-bank-transfers-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bank_transfers',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log("Bank transfer updated:", payload);
            
            // Check if status was changed to 'received' or 'reçu'
            if (payload.new && 
                (payload.new.status === 'received' || payload.new.status === 'reçu') &&
                (!payload.old || 
                 (payload.old.status !== 'received' && payload.old.status !== 'reçu'))) {
              
              console.log("Bank transfer marked as received, refreshing balance");
              
              // Refresh wallet balance
              refreshBalance();
              
              // Custom notification with the wallet icon for deposit success
              toast.custom((t) => (
                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg shadow-lg border border-blue-200 flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Dépôt réussi</h3>
                    <p>Votre dépôt de {payload.new.amount}€ a été crédité sur votre compte.</p>
                  </div>
                </div>
              ), {
                duration: 6000,
                id: `deposit-success-${payload.new.id}`
              });
            }
          }
        )
        .subscribe((status) => {
          console.log("Realtime subscription status for bank transfers:", status);
        });
      
      return bankTransfersChannel;
    };
    
    const bankTransferPromise = setupBankTransferSubscriptions();
    
    return () => {
      bankTransferPromise.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, [refreshBalance]);

  const handleDeposit = async () => {
    await refreshBalance();
  };

  const handleWithdraw = async () => {
    await refreshBalance();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      <WalletBalance 
        balance={walletBalance} 
        isLoading={isLoadingBalance} 
        onTabChange={handleTabChange}
        onRefresh={refreshBalance}
        onRecalculate={recalculateBalance}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="deposit">Dépôt</TabsTrigger>
          <TabsTrigger value="withdraw">Retrait</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <ActionButtons onDeposit={handleDeposit} onWithdraw={handleWithdraw} refreshBalance={refreshBalance} />
          <WalletHistory refreshBalance={refreshBalance} />
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
              <WithdrawFundsForm balance={walletBalance} onWithdraw={handleWithdraw} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
