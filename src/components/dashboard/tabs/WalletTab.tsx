
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
import { FixDepositButton } from "../wallet/FixDepositButton";
import { AlertCircle } from "lucide-react";

export default function WalletTab() {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [hasMissingDeposit, setHasMissingDeposit] = useState(false);

  useEffect(() => {
    fetchWalletBalance();
    checkForMissingDeposit();
    
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

  const checkForMissingDeposit = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) return;
      
      // Check for a bank transfer with reference DEP-396509
      const { data: transfer } = await supabase
        .from('bank_transfers')
        .select('*')
        .eq('user_id', session.session.user.id)
        .ilike('reference', '%DEP-396509%')
        .eq('status', 'completed')
        .maybeSingle();
        
      if (transfer) {
        // Check if there's a completed wallet transaction for this transfer
        const { data: transaction } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('amount', transfer.amount)
          .ilike('description', '%DEP-396509%')
          .eq('status', 'completed')
          .maybeSingle();
          
        // If no completed transaction found, show the fix button
        setHasMissingDeposit(!transaction);
      }
    } catch (error) {
      console.error("Error checking for missing deposit:", error);
    }
  };

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

  const handleFixSuccess = () => {
    fetchWalletBalance();
    setHasMissingDeposit(false);
    toast.success("Le dépôt a été correctement crédité sur votre compte");
  };

  return (
    <div className="space-y-6">
      <WalletBalance 
        balance={balance} 
        isLoading={isLoading} 
        onTabChange={handleTabChange}
      />
      
      {hasMissingDeposit && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <div>
              <p className="font-medium text-amber-800">Dépôt non crédité détecté</p>
              <p className="text-amber-700 text-sm">Votre virement bancaire (DEP-396509) a été reçu mais n'a pas été crédité sur votre compte. Utilisez le bouton ci-dessous pour résoudre ce problème.</p>
            </div>
            <FixDepositButton reference="DEP-396509" onSuccess={handleFixSuccess} />
          </div>
        </div>
      )}
      
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
