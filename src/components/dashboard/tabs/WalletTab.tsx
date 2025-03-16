
import React, { useState, useEffect, useCallback } from "react";
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
import { Wallet, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WalletTab() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showWithdrawalAlert, setShowWithdrawalAlert] = useState(false);
  const { walletBalance, isLoadingBalance, refreshBalance, recalculateBalance, updateBalanceOnWithdrawal } = useWalletBalance();

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
      
      // Subscribe to withdrawal_requests table changes
      const withdrawalChannel = supabase
        .channel('wallet-withdrawal-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'withdrawal_requests',
            filter: `user_id=eq.${userId}`
          },
          async (payload) => {
            console.log("Withdrawal request change detected:", payload);
            
            // For INSERT events, we've already deducted the balance in the form
            if (payload.eventType === 'INSERT') {
              console.log("New withdrawal request created, balance already updated in form");
              refreshBalance();
              return;
            }
            
            // For UPDATE events, check if we need to update the balance
            if (payload.eventType === 'UPDATE') {
              const oldStatus = payload.old?.status;
              const newStatus = payload.new?.status;
              
              console.log(`Withdrawal status changed from ${oldStatus} to ${newStatus}`);
              
              // Force a balance recalculation to ensure accuracy
              await recalculateBalance();
            }
          }
        )
        .subscribe((status) => {
          console.log("Realtime subscription status for withdrawals:", status);
        });
      
      // Also subscribe to direct wallet_balance changes in profiles table
      const profileChannel = supabase
        .channel('wallet-profile-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`
          },
          (payload) => {
            console.log("Profile updated:", payload);
            
            if (payload.new && payload.old && 
                payload.new.wallet_balance !== payload.old.wallet_balance) {
              console.log(`Wallet balance changed from ${payload.old.wallet_balance} to ${payload.new.wallet_balance}`);
              refreshBalance();
            }
          }
        )
        .subscribe();
      
      return [bankTransfersChannel, withdrawalChannel, profileChannel];
    };
    
    const subscriptionPromise = setupBankTransferSubscriptions();
    
    return () => {
      subscriptionPromise.then(channels => {
        channels?.forEach(channel => {
          if (channel) supabase.removeChannel(channel);
        });
      });
    };
  }, [refreshBalance, updateBalanceOnWithdrawal, recalculateBalance]);

  const handleDeposit = async () => {
    await refreshBalance();
  };

  const handleWithdraw = async () => {
    // Force immediate recalculation after withdrawal
    await recalculateBalance();
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
      
      {showWithdrawalAlert && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Une demande de retrait a été traitée mais votre solde pourrait ne pas être à jour. Veuillez cliquer sur "Recalculer" pour mettre à jour votre solde.
          </AlertDescription>
        </Alert>
      )}
      
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
