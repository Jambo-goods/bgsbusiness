
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

  // Auto-recalculate when tab loads
  useEffect(() => {
    console.log("WalletTab loaded, current balance:", walletBalance);
    
    // Force recalculation when the component loads
    const initialRecalculation = async () => {
      console.log("Performing initial wallet balance recalculation");
      await recalculateBalance();
    };
    
    initialRecalculation();
  }, [recalculateBalance]);

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
              
              // Refresh balance when we get a deposit-related notification
              if (notification.type === 'deposit') {
                refreshBalance();
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("Realtime subscription status for notifications:", status);
        });
      
      // Subscribe to bank transfers table changes
      const bankTransfersChannel = supabase
        .channel('wallet-bank-transfers-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bank_transfers',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log("Bank transfer changed in real-time:", payload);
            
            // Check for status changes to 'received' or 'reçu'
            if (payload.new && payload.new.status && 
                (payload.new.status === 'received' || payload.new.status === 'reçu')) {
              console.log("Bank transfer received, refreshing balance");
              refreshBalance();
              
              const amount = payload.new.amount || 0;
              toast.success("Virement bancaire reçu!", {
                description: `${amount}€ ont été ajoutés à votre portefeuille.`
              });
            }
          }
        )
        .subscribe((status) => {
          console.log("Realtime subscription status for bank transfers:", status);
        });
      
      return [notificationsChannel, bankTransfersChannel];
    };
    
    const subscriptionPromise = setupNotificationSubscriptions();
    
    return () => {
      subscriptionPromise.then(channels => {
        if (channels) {
          channels.forEach(channel => {
            if (channel) supabase.removeChannel(channel);
          });
        }
      });
    };
  }, [refreshBalance]);

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
