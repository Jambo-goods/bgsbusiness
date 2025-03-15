
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useInvestmentSubscriptions = (
  userId: string | null,
  refreshCallback: () => void
) => {
  useEffect(() => {
    if (!userId) return;
    
    console.log("Setting up real-time subscriptions for user:", userId);
    
    // Investments channel with filter for user's investments
    const investmentChannel = supabase
      .channel('investment_tracking_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments',
        filter: `user_id=eq.${userId}`
      }, async (payload) => {
        console.log('Investment data changed, refreshing tracking tab...', payload);
        
        toast.info("Mise à jour des investissements", {
          description: "Les données de suivi sont en cours d'actualisation."
        });
        refreshCallback();
      })
      .subscribe();
      
    // Wallet transactions could affect yields
    const walletChannel = supabase
      .channel('wallet_tracking_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wallet_transactions',
        filter: `user_id=eq.${userId}`
      }, async (payload) => {
        console.log('Wallet transaction detected, refreshing tracking...', payload);
        
        toast.info("Transaction détectée", {
          description: "Les données de rendement sont en cours d'actualisation."
        });
        refreshCallback();
      })
      .subscribe();
      
    console.log("Real-time subscriptions set up successfully");
    
    return () => {
      console.log("Cleaning up investment tracking subscriptions");
      if (investmentChannel) supabase.removeChannel(investmentChannel);
      if (walletChannel) supabase.removeChannel(walletChannel);
    };
  }, [userId, refreshCallback]);
};
