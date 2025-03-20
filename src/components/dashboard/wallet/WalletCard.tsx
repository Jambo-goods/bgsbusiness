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
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      
      const walletTransactionsChannel = supabase
        .channel('wallet_transactions_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${data.session.user.id}` }, 
          (payload) => {
            console.log('Wallet transaction change detected:', payload);
            refreshBalance();
            
            if (payload.eventType === 'INSERT') {
              const newTransaction = payload.new;
              if (newTransaction.type === 'deposit' && newTransaction.status === 'completed') {
                toast.success(`Dépôt de ${newTransaction.amount}€ crédité sur votre compte`);
              }
            }
          }
        )
        .subscribe();
        
      const profilesChannel = supabase
        .channel('profiles_balance_changes')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${data.session.user.id}` }, 
          (payload) => {
            console.log('Profile change detected:', payload);
            refreshBalance();
            
            if (payload.old.wallet_balance !== payload.new.wallet_balance) {
              const difference = payload.new.wallet_balance - payload.old.wallet_balance;
              if (difference > 0) {
                toast.success(`Votre solde a été augmenté de ${difference}€`);
              }
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(walletTransactionsChannel);
        supabase.removeChannel(profilesChannel);
      };
    };
    
    getSession();
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
            onClick={refreshBalance}
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
