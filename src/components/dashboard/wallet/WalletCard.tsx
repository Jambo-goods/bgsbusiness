
import React, { useEffect, useRef } from "react";
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
  const lastRefreshTime = useRef<number>(Date.now());
  const isRefreshing = useRef<boolean>(false);
  const MIN_REFRESH_INTERVAL = 30000; // 30 seconds between refreshes
  const subscriptionsSet = useRef<boolean>(false);
  
  useEffect(() => {
    console.log("WalletCard rendered with balance:", balance, "isLoading:", isLoading);
  }, [balance, isLoading]);
  
  // Set up realtime updates for wallet balance with less frequent updates
  useEffect(() => {
    if (subscriptionsSet.current) return;
    
    const setupRealtimeListeners = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      
      subscriptionsSet.current = true;
      const userId = data.session.user.id;
      console.log("Setting up wallet card realtime listeners for user:", userId);
      
      // Listen for significant profile changes only (direct wallet balance updates)
      const profilesChannel = supabase
        .channel('wallet_card_balance_direct_updates_stable_fixed')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, 
          (payload) => {
            if (payload.new && payload.old && 
                typeof payload.new === 'object' && typeof payload.old === 'object' &&
                'wallet_balance' in payload.new && 'wallet_balance' in payload.old &&
                payload.new.wallet_balance !== payload.old.wallet_balance) {
              
              // Only if balance has increased significantly
              const newBalance = Number(payload.new.wallet_balance);
              const oldBalance = Number(payload.old.wallet_balance);
              const difference = Math.abs(newBalance - oldBalance);
              
              if (difference > 50) { // Only for significant changes (> 50€)
                // Only if we haven't refreshed recently
                const currentTime = Date.now();
                if (currentTime - lastRefreshTime.current > MIN_REFRESH_INTERVAL && !isRefreshing.current) {
                  console.log(`Significant balance change detected: ${oldBalance} → ${newBalance}`);
                  lastRefreshTime.current = currentTime;
                  isRefreshing.current = true;
                  
                  // Delay for a moment to allow state to settle
                  setTimeout(() => {
                    onManualRefresh();
                    isRefreshing.current = false;
                  }, 500);
                }
              }
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(profilesChannel);
      };
    };
    
    setupRealtimeListeners();
  }, [onManualRefresh]);
  
  const handleManualRefresh = () => {
    // Allow manual refresh only if enough time has passed
    const currentTime = Date.now();
    if (currentTime - lastRefreshTime.current > MIN_REFRESH_INTERVAL && !isRefreshing.current) {
      isRefreshing.current = true;
      lastRefreshTime.current = currentTime;
      onManualRefresh();
      
      // Reset the refreshing state after a delay
      setTimeout(() => {
        isRefreshing.current = false;
      }, 2000);
    } else {
      console.log("Manual refresh skipped due to rate limiting");
    }
  };
  
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
            onClick={handleManualRefresh}
            disabled={isLoading || isRefreshing.current}
            className="h-8 w-8 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing.current ? 'animate-spin' : ''}`} />
            <span className="sr-only">Actualiser</span>
          </Button>
        </CardTitle>
        <CardDescription className="text-white/90">
          Gérez vos fonds disponibles
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-12">
            <Skeleton className="h-12 w-40 bg-gray-200" />
          </div>
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
