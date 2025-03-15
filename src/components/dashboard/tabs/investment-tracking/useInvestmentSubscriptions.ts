
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useInvestmentSubscriptions(userId: string | null) {
  const [hasNewPayments, setHasNewPayments] = useState(false);
  
  useEffect(() => {
    if (!userId) return;
    
    console.log("Setting up investment subscriptions for user:", userId);
    
    // Subscribe to scheduled_payments updates
    const paymentsChannel = supabase
      .channel('investment-payments-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scheduled_payments',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log("New payment received:", payload);
          
          const paymentAmount = payload.new?.amount || 0;
          
          // Show toast notification
          toast.success("Nouveau paiement reçu", {
            description: `Un rendement de ${paymentAmount}€ a été ajouté à votre portefeuille.`
          });
          
          // Set flag to show notification in UI
          setHasNewPayments(true);
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });
    
    // Cleanup function
    return () => {
      console.log("Cleaning up investment subscriptions");
      supabase.removeChannel(paymentsChannel);
    };
  }, [userId]);
  
  return {
    hasNewPayments,
    clearNewPaymentsFlag: () => setHasNewPayments(false)
  };
}
