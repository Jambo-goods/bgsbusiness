
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WalletCardProps {
  balance: number;
  isLoading: boolean;
  onManualRefresh: () => void;
}

export function WalletCard({ balance, isLoading, onManualRefresh }: WalletCardProps) {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("WalletCard rendered with balance:", balance);
  }, [balance]);
  
  // Listen to realtime updates for wallet balance
  useEffect(() => {
    const setupRealtimeListeners = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      
      const userId = data.session.user.id;
      console.log("Setting up wallet card realtime listeners for user:", userId);
      
      // Listen for profile changes (direct wallet balance updates)
      const profilesChannel = supabase
        .channel('wallet_card_balance_direct_updates')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, 
          (payload) => {
            console.log('Profile change detected in WalletCard:', payload);
            
            if (payload.new && payload.old && 
                payload.new.wallet_balance !== payload.old.wallet_balance) {
              // Show a notification if balance increased
              const difference = payload.new.wallet_balance - payload.old.wallet_balance;
              if (difference > 0) {
                toast.success(`Votre solde a été augmenté de ${difference}€`);
              }
              
              // Force refresh
              onManualRefresh();
            }
          }
        )
        .subscribe();
      
      // Listen for wallet transactions (admin completions)
      const walletTransactionsChannel = supabase
        .channel('wallet_card_transactions_updates')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${userId}` }, 
          (payload) => {
            console.log('Wallet transaction change detected in WalletCard:', payload);
            
            // Type safety check for payload.new
            if (payload.new && typeof payload.new === 'object') {
              const transaction = payload.new as Record<string, any>;
              
              if (transaction.type === 'deposit' && 
                  transaction.status === 'completed') {
                
                // Check for status change from pending to completed
                if (payload.old && typeof payload.old === 'object' && 
                    (payload.old as Record<string, any>).status !== 'completed') {
                  toast.success(`Dépôt de ${transaction.amount}€ crédité sur votre compte`);
                }
                
                // Force refresh
                onManualRefresh();
              }
            }
          }
        )
        .subscribe();
        
      // Listen for bank transfers specifically
      const bankTransfersChannel = supabase
        .channel('wallet_card_bank_transfers_updates')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'bank_transfers' }, 
          (payload) => {
            console.log('Bank transfer change detected in WalletCard:', payload);
            
            // Type safety check for payload.new
            if (payload.new && typeof payload.new === 'object') {
              const newData = payload.new as Record<string, any>;
              
              // Force refresh if a transfer is completed
              if (newData.status === 'completed' || 
                  newData.status === 'received' || 
                  newData.status === 'reçu') {
                
                // Force refresh
                onManualRefresh();
              }
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(profilesChannel);
        supabase.removeChannel(walletTransactionsChannel);
        supabase.removeChannel(bankTransfersChannel);
      };
    };
    
    setupRealtimeListeners();
  }, [onManualRefresh]);
  
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
            onClick={onManualRefresh}
            disabled={isLoading}
            className="h-8 w-8 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Actualiser</span>
          </Button>
        </CardTitle>
        <CardDescription className="text-white/90">
          Gérez vos fonds disponibles
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <div className="text-center">
            <div className="text-3xl font-bold text-bgs-blue">{balance.toLocaleString('fr-FR')} €</div>
            <p className="text-muted-foreground mt-2">Solde disponible</p>
          </div>
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
