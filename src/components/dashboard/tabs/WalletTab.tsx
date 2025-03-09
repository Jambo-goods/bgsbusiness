
import React, { useState } from "react";
import { toast } from "sonner";
import WalletBalance from "./wallet/WalletBalance";
import ActionButtons from "./wallet/ActionButtons";
import WalletHistory from "./wallet/WalletHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BankTransferInstructions from "./wallet/BankTransferInstructions";
import WithdrawFundsForm from "./wallet/WithdrawFundsForm";
import { useWalletBalance } from "@/hooks/useWalletBalance";

export default function WalletTab() {
  const { walletBalance: balance, isLoadingBalance: isLoading, refreshBalance } = useWalletBalance();
  const [activeTab, setActiveTab] = useState("overview");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleDeposit = async () => {
    await refreshBalance();
  };

  const handleWithdraw = async () => {
    await refreshBalance();
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
              <WithdrawFundsForm balance={balance} onWithdraw={handleWithdraw} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
