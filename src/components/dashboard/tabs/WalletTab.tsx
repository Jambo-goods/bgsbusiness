
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { WalletBalance } from "./wallet/WalletBalance";
import WalletHistory from "./wallet/WalletHistory";
import BankTransferInstructions from "./wallet/BankTransferInstructions";
import WithdrawFundsForm from "./wallet/WithdrawFundsForm";
import WithdrawalRequestsTable from "./wallet/WithdrawalRequestsTable";
import ActionButtons from "./wallet/ActionButtons";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function WalletTab() {
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const location = useLocation();

  useEffect(() => {
    // Check if we have a state with an activeTab parameter
    if (location.state && location.state.activeTab) {
      setActiveSubTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-bgs-blue">Portefeuille</h2>
        <p className="text-gray-600 mt-1">
          Gérez vos fonds, effectuez des dépôts et des retraits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <WalletBalance />
          <ActionButtons className="mt-4" />
        </div>
        
        <div className="md:col-span-2">
          <Card className="border-0 shadow-sm">
            <Tabs 
              value={activeSubTab} 
              onValueChange={setActiveSubTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-2">
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="deposit">Déposer</TabsTrigger>
                <TabsTrigger value="withdraw">Retirer</TabsTrigger>
              </TabsList>
              
              <CardContent className="p-6">
                <TabsContent value="overview" className="mt-0">
                  <WalletHistory />
                </TabsContent>
                
                <TabsContent value="deposit" className="mt-0">
                  <BankTransferInstructions />
                </TabsContent>
                
                <TabsContent value="withdraw" className="mt-0">
                  <WithdrawFundsForm />
                  <WithdrawalRequestsTable className="mt-8" />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
