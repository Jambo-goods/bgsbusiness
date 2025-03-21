
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function WalletCard() {
  const { walletBalance, isLoadingBalance, refreshBalance, error } = useWalletBalance();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Initial balance fetch with force refresh
    refreshBalance(true);
    
    // Set up aggressive polling as a fallback mechanism
    const intervalId = setInterval(() => {
      refreshBalance(false); // Silent refresh (no loading indicator)
    }, 5000); // Check every 5 seconds for better responsiveness
    
    return () => {
      clearInterval(intervalId);
    };
  }, [refreshBalance]);
  
  useEffect(() => {
    const setupRealtimeListeners = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      
      const userId = data.session.user.id;
      console.log("Setting up wallet card realtime listeners for user:", userId);
      
      // Listen for completed wallet transactions (this should catch admin-processed transfers)
      const walletTransactionsChannel = supabase
        .channel('wallet_card_transactions')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${userId}` }, 
          (payload) => {
            console.log('Wallet transaction change detected in WalletCard:', payload);
            
            // Force a balance refresh for any transaction change
            refreshBalance(false);
            
            // Only show notification for new completed deposits
            if (payload.eventType === 'INSERT' || 
                (payload.eventType === 'UPDATE' && 
                 payload.old?.status !== 'completed' && 
                 payload.new?.status === 'completed')) {
              
              const transaction = payload.new;
              if (transaction.type === 'deposit' && transaction.status === 'completed') {
                toast.success(`Dépôt de ${transaction.amount}€ crédité sur votre compte`);
              }
            }
          }
        )
        .subscribe();
        
      // Listen specifically for profile balance changes
      const profilesChannel = supabase
        .channel('wallet_card_balance_changes')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, 
          (payload) => {
            console.log('Profile change detected in WalletCard:', payload);
            
            // Immediately update the displayed balance without waiting for the next fetch
            if (payload.new && payload.old && 
                payload.new.wallet_balance !== payload.old.wallet_balance) {
              
              refreshBalance(false);
              
              // Show a notification if balance increased
              const difference = payload.new.wallet_balance - payload.old.wallet_balance;
              if (difference > 0) {
                toast.success(`Votre solde a été augmenté de ${difference}€`);
              }
            }
          }
        )
        .subscribe();
      
      // Listen for bank transfers specifically (to catch admin completions)
      const bankTransfersChannel = supabase
        .channel('wallet_card_bank_transfers')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'bank_transfers', filter: `user_id=eq.${userId}` }, 
          (payload) => {
            console.log('Bank transfer change detected in WalletCard:', payload);
            
            // Force balance refresh when a transfer is completed
            if (payload.new && 
                (payload.new.status === 'completed' || payload.new.status === 'received') &&
                payload.old && 
                payload.old.status !== 'completed' && 
                payload.old.status !== 'received') {
              
              console.log('Bank transfer completed, refreshing balance immediately');
              // Force an immediate refresh without waiting for other mechanisms
              refreshBalance(false);
              
              // Show notification about the completed transfer
              if (payload.new.amount) {
                toast.success(`Virement de ${payload.new.amount}€ crédité sur votre compte`);
              }
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(walletTransactionsChannel);
        supabase.removeChannel(profilesChannel);
        supabase.removeChannel(bankTransfersChannel);
      };
    };
    
    setupRealtimeListeners();
  }, [refreshBalance]);
  
  const handleInstructionsClick = () => {
    navigate("/dashboard/wallet", { state: { activeTab: "deposit" } });
  };
  
  const handleWithdrawClick = () => {
    navigate("/dashboard/wallet", { state: { activeTab: "withdraw" } });
  };
  
  return (
    <Card className="shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-bgs-blue to-bgs-blue-light text-white">
        <CardTitle className="flex justify-between items-center">
          <span>Votre portefeuille</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refreshBalance(true)}
            disabled={isLoadingBalance}
            className="h-8 w-8 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
            <span className="sr-only">Actualiser</span>
          </Button>
        </CardTitle>
        <CardDescription className="text-white/90">
          Gérez vos fonds disponibles
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoadingBalance ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <div className="text-center">
            <div className="text-3xl font-bold text-bgs-blue">{walletBalance.toLocaleString('fr-FR')} €</div>
            <p className="text-muted-foreground mt-2">Solde disponible</p>
          </div>
        )}
        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button variant="outline" size="sm" className="w-full" onClick={handleWithdrawClick}>
          Demander un retrait
        </Button>
      </CardFooter>
    </Card>
  );
}
