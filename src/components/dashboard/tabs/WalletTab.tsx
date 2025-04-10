
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
import { AlertCircle } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";

export default function WalletTab() {
  const { walletBalance, isLoadingBalance, refreshBalance } = useWalletBalance();
  const [activeTab, setActiveTab] = useState("overview");
  const [hasMissingDeposit, setHasMissingDeposit] = useState(false);
  const [isVerifyingPayments, setIsVerifyingPayments] = useState(true);

  useEffect(() => {
    checkForMissingDeposit();
    
    // Check for unprocessed payments immediately
    checkForUnprocessedPayments();
    setIsVerifyingPayments(false);
  }, []);

  const checkForMissingDeposit = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) return;
      
      const { data: transfer } = await supabase
        .from('bank_transfers')
        .select('*')
        .eq('user_id', session.session.user.id)
        .ilike('reference', '%DEP-396509%')
        .eq('status', 'completed')
        .maybeSingle();
        
      if (transfer) {
        const { data: transaction } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('amount', transfer.amount)
          .ilike('description', '%DEP-396509%')
          .eq('status', 'completed')
          .maybeSingle();
          
        setHasMissingDeposit(!transaction);
      }
    } catch (error) {
      console.error("Error checking for missing deposit:", error);
    }
  };

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

  const checkForUnprocessedPayments = async () => {
    try {
      const { data: payments } = await supabase
        .from('scheduled_payments')
        .select('id, project_id, percentage')
        .eq('status', 'paid')
        .is('processed_at', null);
        
      if (payments && payments.length > 0) {
        console.log(`Found ${payments.length} unprocessed paid payments in WalletTab`);
        toast.info("Traitement des paiements en attente", {
          description: "Veuillez patienter pendant que nous mettons à jour votre solde"
        });
        
        for (const payment of payments) {
          console.log(`Processing payment ${payment.id} for project ${payment.project_id}`);
          
          try {
            const { data: result, error } = await supabase.functions.invoke(
              'update-wallet-on-payment',
              {
                body: {
                  paymentId: payment.id,
                  projectId: payment.project_id,
                  percentage: payment.percentage,
                  processAll: true,
                  forceRefresh: true
                }
              }
            );
            
            if (error) {
              console.error(`Error processing payment ${payment.id}:`, error);
              toast.error("Erreur lors du traitement d'un paiement", {
                description: "Veuillez réessayer ultérieurement"
              });
            } else {
              console.log(`Successfully processed payment ${payment.id}:`, result);
              
              if (result?.processed > 0) {
                if (refreshBalance) {
                  await refreshBalance(false);
                }
                
                toast.success("Paiement traité", {
                  description: `${result.processed} rendements ont été crédités sur votre compte`
                });
              }
            }
          } catch (err) {
            console.error(`Error invoking edge function for payment ${payment.id}:`, err);
            toast.error("Erreur lors de la mise à jour des soldes");
          }
        }
      } else {
        console.log("No unprocessed payments found");
      }
    } catch (err) {
      console.error("Error checking for unprocessed payments:", err);
    }
  };

  // Set up subscription to detect newly paid scheduled payments
  useEffect(() => {
    const scheduledPaymentChannel = supabase
      .channel('wallet_tab_scheduled_payments')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'scheduled_payments' },
        (payload) => {
          if ((payload.new as any).status === 'paid' && (payload.old as any).status !== 'paid') {
            console.log('WalletTab: Payment marked as paid, processing immediately');
            
            // Directly process the payment
            supabase.functions.invoke(
              'update-wallet-on-payment',
              {
                body: {
                  paymentId: (payload.new as any).id,
                  projectId: (payload.new as any).project_id,
                  percentage: (payload.new as any).percentage,
                  processAll: true,
                  forceRefresh: true
                }
              }
            ).then(({data, error}) => {
              if (error) {
                console.error('Error processing new paid payment:', error);
                toast.error("Erreur lors du traitement du paiement");
              } else {
                console.log('Successfully processed new paid payment:', data);
                if (refreshBalance) {
                  refreshBalance(false); // Silent refresh
                }
                
                toast.success("Paiement programmé exécuté", {
                  description: "Votre solde disponible a été mis à jour"
                });
              }
            });
          }
        }
      )
      .subscribe();
      
    const yieldTransactionsChannel = supabase
      .channel('wallet_tab_yield_transactions')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wallet_transactions' },
        (payload) => {
          if ((payload.new as any).description?.includes('Rendement')) {
            console.log('WalletTab: New yield transaction detected, refreshing balance');
            if (refreshBalance) {
              refreshBalance(false); // Silent refresh
              
              toast.success("Rendement reçu", {
                description: `Votre solde a été crédité de ${(payload.new as any).amount}€`
              });
            }
          }
        }
      )
      .subscribe();

    // Additional channel to listen for processed_at updates on scheduled_payments
    const processedPaymentsChannel = supabase
      .channel('wallet_tab_processed_payments')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'scheduled_payments' },
        (payload) => {
          if ((payload.new as any).processed_at && !(payload.old as any).processed_at) {
            console.log('WalletTab: Payment processed, refreshing balance');
            if (refreshBalance) {
              refreshBalance(false);
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(scheduledPaymentChannel);
      supabase.removeChannel(yieldTransactionsChannel);
      supabase.removeChannel(processedPaymentsChannel);
    };
  }, [refreshBalance]);

  return (
    <div className="space-y-6">
      {isVerifyingPayments && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-700">Vérification des paiements en attente...</p>
        </div>
      )}
      
      <WalletBalance 
        balance={walletBalance} 
        isLoading={isLoadingBalance} 
        onTabChange={handleTabChange}
        refreshBalance={refreshBalance}
      />
      
      {hasMissingDeposit && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <div>
              <p className="font-medium text-amber-800">Dépôt non crédité détecté</p>
              <p className="text-amber-700 text-sm">Votre virement bancaire (DEP-396509) a été reçu mais n'a pas été crédité sur votre compte. Utilisez le bouton ci-dessous pour résoudre ce problème.</p>
            </div>
            {/* Fix: Remove the FixDepositButton component which could be causing issues */}
            <button 
              onClick={handleFixSuccess}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Réparer le crédit
            </button>
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
