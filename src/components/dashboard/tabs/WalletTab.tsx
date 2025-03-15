
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
import { notificationService } from "@/services/notifications";

export default function WalletTab() {
  const [activeTab, setActiveTab] = useState("overview");
  const { walletBalance, isLoadingBalance, refreshBalance, recalculateBalance } = useWalletBalance();

  // Auto-recalculate when tab loads if balance is zero
  useEffect(() => {
    if (walletBalance === 0 && !isLoadingBalance) {
      console.log("Wallet balance is zero, automatically recalculating...");
      recalculateBalance();
    }
  }, [walletBalance, isLoadingBalance, recalculateBalance]);

  // Setup notifications and wallet transaction subscriptions
  useEffect(() => {
    console.log("Setting up wallet tab subscriptions");
    
    const setupNotificationSubscriptions = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) return;
      
      console.log("Setting up notification subscriptions for user:", userId);
      
      // Subscribe to notifications table changes
      const notificationsChannel = supabase
        .channel('wallet-notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log("New notification received:", payload);
            if (payload.new) {
              const notification = payload.new as Record<string, any>;
              toast.success(notification.title, {
                description: notification.description
              });
            }
          }
        )
        .subscribe((status) => {
          console.log("Realtime subscription status for notifications:", status);
        });
      
      return notificationsChannel;
    };
    
    const subscriptionPromise = setupNotificationSubscriptions();
    
    return () => {
      subscriptionPromise.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, []);

  const handleDeposit = async () => {
    await refreshBalance();
    // Create a test notification on deposit
    await notificationService.depositSuccess(500);
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
