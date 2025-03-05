
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRealtimeUpdates(refreshCallback: () => void) {
  useEffect(() => {
    // Configurer un abonnement en temps réel aux mises à jour
    const profileChannel = supabase
      .channel('dashboard-profile-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles'
      }, () => {
        refreshCallback();
      })
      .subscribe();
    
    const investmentsChannel = supabase
      .channel('dashboard-investments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments'
      }, () => {
        refreshCallback();
      })
      .subscribe();
    
    const transactionsChannel = supabase
      .channel('dashboard-transactions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wallet_transactions'
      }, () => {
        refreshCallback();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(investmentsChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [refreshCallback]);
}
