
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
import PaymentVerifier from "./wallet/PaymentVerifier";
import MissingDepositAlert from "./wallet/MissingDepositAlert";
import { useMissingDeposit } from "./wallet/hooks/useMissingDeposit";
import { usePaymentSubscriptions } from "./wallet/hooks/usePaymentSubscriptions";

export default function WalletTab() {
  const { walletBalance, isLoadingBalance, refreshBalance } = useWalletBalance();
  const [activeTab, setActiveTab] = useState("overview");
  const [isVerifyingPayments, setIsVerifyingPayments] = useState(true);
  const { hasMissingDeposit, setHasMissingDeposit } = useMissingDeposit();

  // Set up realtime subscriptions
  usePaymentSubscriptions(refreshBalance);
  
  const handleDeposit = () => {
    setActiveTab("deposit");
  };

  const handleWithdraw = async () => {
    console.log('handleWithdraw called');
    setActiveTab("withdraw");
    if (refreshBalance) {
      await refreshBalance();
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleFixSuccess = () => {
    if (refreshBalance) {
      refreshBalance();
    }
    setHasMissingDeposit(false);
    toast.success("Le dépôt a été correctement crédité sur votre compte");
  };

  return (
    <div className="space-y-6">
      {isVerifyingPayments && (
        <PaymentVerifier 
          refreshBalance={refreshBalance}
          onVerificationComplete={() => setIsVerifyingPayments(false)}
        />
      )}
      
      <WalletBalance 
        balance={walletBalance} 
        isLoading={isLoadingBalance} 
        onTabChange={handleTabChange}
        refreshBalance={refreshBalance}
      />
      
      <MissingDepositAlert
        hasMissingDeposit={hasMissingDeposit}
        onFixSuccess={handleFixSuccess}
      />
      
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
            refreshBalance={refreshBalance} 
          />
          <WalletHistory className="mt-6" refreshBalance={refreshBalance} />
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
              <WithdrawFundsForm balance={walletBalance} onWithdraw={handleWithdraw} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
