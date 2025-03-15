
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useBankTransferStatus(refreshBalance: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const { data: session } = supabase.auth.getSession();
    if (!session) return;

    // Set up realtime subscription to the bank_transfers table
    const channel = supabase
      .channel('bank-transfers-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bank_transfers',
          filter: 'status=eq.received'
        },
        async (payload) => {
          console.log('Bank transfer status changed to received:', payload);
          
          // Get the updated bank transfer
          const { data: bankTransfer, error } = await supabase
            .from('bank_transfers')
            .select('*')
            .eq('id', payload.new.id)
            .single();
            
          if (error) {
            console.error("Error fetching bank transfer:", error);
            return;
          }
          
          // If status is 'received', automatically credit the user's wallet
          if (bankTransfer && bankTransfer.status === 'received' && bankTransfer.amount) {
            try {
              setIsLoading(true);
              
              // Update the user's wallet balance
              await supabase.rpc('increment_wallet_balance', {
                user_id: bankTransfer.user_id,
                increment_amount: bankTransfer.amount
              });
              
              // Create a completed wallet transaction
              await supabase.from('wallet_transactions').insert({
                user_id: bankTransfer.user_id,
                amount: bankTransfer.amount,
                type: 'deposit',
                status: 'completed',
                description: `Virement bancaire reçu (réf: ${bankTransfer.reference})`
              });
              
              // Create notification for the user
              await supabase.from('notifications').insert({
                user_id: bankTransfer.user_id,
                title: "Dépôt effectué",
                description: `Votre virement bancaire de ${bankTransfer.amount}€ a été reçu et crédité sur votre portefeuille.`,
                type: "deposit",
                category: "success",
                metadata: {
                  amount: bankTransfer.amount,
                  reference: bankTransfer.reference
                }
              });
              
              // Refresh balance in the UI
              refreshBalance();
              
              // Show toast notification to the user if it's their transfer
              const { data: session } = await supabase.auth.getSession();
              if (session?.session?.user.id === bankTransfer.user_id) {
                toast.success(`Votre virement de ${bankTransfer.amount}€ a été reçu et crédité sur votre portefeuille.`);
              }
              
            } catch (error) {
              console.error("Error processing received bank transfer:", error);
            } finally {
              setIsLoading(false);
            }
          }
        }
      )
      .subscribe();

    // Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshBalance]);

  return { isLoading };
}
