
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { processSinglePayment } from "../utils/paymentProcessing";

export function usePaymentSubscriptions(refreshBalance: (() => Promise<void>) | undefined) {
  useEffect(() => {
    // Set up subscription to detect newly paid scheduled payments
    const scheduledPaymentChannel = supabase
      .channel('wallet_tab_scheduled_payments')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'scheduled_payments' },
        (payload) => {
          if ((payload.new as any).status === 'paid' && (payload.old as any).status !== 'paid') {
            console.log('WalletTab: Payment marked as paid, processing immediately');
            
            // Directly process the payment
            processSinglePayment(
              (payload.new as any).id,
              (payload.new as any).project_id,
              (payload.new as any).percentage
            ).then(({success, processed}) => {
              if (!success) {
                console.error('Error processing new paid payment');
                toast.error("Erreur lors du traitement du paiement");
              } else {
                console.log('Successfully processed new paid payment');
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
}
