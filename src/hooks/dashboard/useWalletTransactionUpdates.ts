
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useWalletTransactionUpdates(onUpdate: () => void) {
  useEffect(() => {
    const setupTransactionSubscription = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;
        
        const userId = session.session.user.id;
        console.log("Setting up wallet transaction updates for user:", userId);
        
        // Listen for updates to wallet_transactions that belong to the current user
        const channel = supabase
          .channel('wallet_transaction_updates')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'wallet_transactions',
            filter: `user_id=eq.${userId}`
          }, (payload) => {
            console.log("Wallet transaction updated:", payload);
            
            // Trigger callback to refresh wallet balance
            onUpdate();
            
            // Show notification to user about transaction updates
            if (payload.eventType === 'INSERT') {
              const newData = payload.new;
              
              if (newData.type === 'deposit') {
                toast.info(`Nouveau dépôt de ${newData.amount}€ créé`, {
                  description: "Il sera traité prochainement."
                });
              } else if (newData.type === 'withdrawal') {
                toast.info(`Nouvelle demande de retrait de ${newData.amount}€`, {
                  description: "Votre demande sera traitée prochainement."
                });
              }
            } else if (payload.eventType === 'UPDATE') {
              const newData = payload.new;
              
              if (newData.status === 'completed' && payload.old.status !== 'completed') {
                if (newData.type === 'deposit') {
                  toast.success(`Dépôt confirmé de ${newData.amount}€`, {
                    description: "Votre solde a été mis à jour."
                  });
                } else if (newData.type === 'withdrawal') {
                  toast.success(`Retrait de ${newData.amount}€ effectué`, {
                    description: "Le virement a été envoyé sur votre compte bancaire."
                  });
                }
              } else if (newData.receipt_confirmed && !payload.old.receipt_confirmed) {
                toast.info("Réception de virement confirmée", {
                  description: "Votre demande est en cours de traitement."
                });
              }
            }
          })
          .subscribe((status) => {
            console.log("Wallet transaction subscription status:", status);
          });
          
        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error setting up wallet transaction updates:", error);
      }
    };
    
    const cleanup = setupTransactionSubscription();
    
    return () => {
      if (cleanup) {
        cleanup.then(unsubscribe => {
          if (unsubscribe) unsubscribe();
        });
      }
    };
  }, [onUpdate]);
}
