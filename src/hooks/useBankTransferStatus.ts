
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useBankTransferStatus(refreshBalance: () => Promise<void>) {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get the current user id
  useEffect(() => {
    const getUserId = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        setUserId(sessionData.session.user.id);
      }
    };
    
    getUserId();
  }, []);

  // Function to check for and process received transfers
  const checkForReceivedTransfers = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      // Find transfers that have been marked as received but haven't been credited to the wallet yet
      const { data: receivedTransfers, error } = await supabase
        .from('bank_transfers')
        .select('id, amount')
        .eq('user_id', userId)
        .eq('status', 'received')
        .eq('processed', false);
        
      if (error) throw error;
      
      if (receivedTransfers && receivedTransfers.length > 0) {
        console.log(`Found ${receivedTransfers.length} unprocessed received transfers`);
        
        for (const transfer of receivedTransfers) {
          // Update the user's wallet balance
          const { error: incrementError } = await supabase.rpc(
            'increment_wallet_balance',
            { 
              user_id: userId, 
              increment_amount: transfer.amount 
            }
          );
          
          if (incrementError) {
            console.error("Error incrementing wallet balance:", incrementError);
            continue;
          }
          
          // Mark the transfer as processed
          const { error: updateError } = await supabase
            .from('bank_transfers')
            .update({ 
              processed: true,
              processed_at: new Date().toISOString()
            })
            .eq('id', transfer.id);
            
          if (updateError) {
            console.error("Error marking transfer as processed:", updateError);
            continue;
          }
          
          // Create a wallet transaction record
          const { error: transactionError } = await supabase
            .from('wallet_transactions')
            .insert({
              user_id: userId,
              amount: transfer.amount,
              type: 'deposit',
              status: 'completed',
              description: `Virement bancaire confirmé et crédité (${transfer.amount}€)`
            });
            
          if (transactionError) {
            console.error("Error creating transaction record:", transactionError);
          }
          
          // Create a notification for the user
          try {
            await supabase
              .from('notifications')
              .insert({
                user_id: userId,
                title: "Virement bancaire reçu",
                description: `Votre virement de ${transfer.amount}€ a été reçu et crédité sur votre portefeuille.`,
                type: "deposit",
                category: "success",
                metadata: { 
                  amount: transfer.amount,
                  transfer_id: transfer.id
                }
              });
          } catch (notifError) {
            console.error("Error creating notification:", notifError);
          }
          
          console.log(`Processed transfer ID ${transfer.id} for ${transfer.amount}€`);
          
          // Update the wallet balance display
          await refreshBalance();
          
          toast.success(
            "Virement bancaire crédité", 
            { description: `Votre virement de ${transfer.amount}€ a été crédité sur votre portefeuille.` }
          );
        }
      }
    } catch (error) {
      console.error("Error checking for received transfers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, refreshBalance]);

  // Check on component mount and set up polling
  useEffect(() => {
    if (userId) {
      checkForReceivedTransfers();
      
      // Set up polling to check every minute
      const interval = setInterval(() => {
        checkForReceivedTransfers();
      }, 60000);
      
      // Set up subscription to real-time changes in bank_transfers table
      const channel = supabase
        .channel('bank_transfers_changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'bank_transfers',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          console.log('Bank transfer updated:', payload);
          
          // If the status changed to 'received', check for received transfers
          if (payload.new.status === 'received' && payload.old.status !== 'received') {
            checkForReceivedTransfers();
          }
        })
        .subscribe();
      
      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    }
  }, [userId, checkForReceivedTransfers]);

  return { isLoading };
}
