
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
        console.log('Wallet transaction detected, refreshing tracking...', payload.new);
        
        if (payload.eventType === 'INSERT') {
          // Determine the type of transaction
          const transaction = payload.new;
          let notificationType = 'info';
          let notificationTitle = 'Nouvelle transaction';
          let notificationMessage = 'Une nouvelle transaction a été enregistrée.';
          
          if (transaction.type === 'deposit') {
            notificationType = 'deposit';
            notificationTitle = 'Nouveau dépôt';
            notificationMessage = `Votre dépôt de ${transaction.amount}€ a été enregistré.`;
          } else if (transaction.type === 'withdrawal') {
            notificationType = 'withdrawal';
            notificationTitle = 'Nouveau retrait';
            notificationMessage = `Votre demande de retrait de ${transaction.amount}€ a été enregistrée.`;
          } else if (transaction.type === 'investment') {
            // Skip investment notifications here - they're handled by the confirmation hook
            console.log('Skipping duplicate investment notification in subscription');
            refreshCallback();
            return;
          } else if (transaction.type === 'yield') {
            notificationType = 'yield';
            notificationTitle = 'Rendement reçu';
            notificationMessage = `Vous avez reçu un rendement de ${transaction.amount}€.`;
          }
          
          // Create a notification in the database
          try {
            console.log('Creating transaction notification:', notificationType);
            await supabase.from('notifications').insert({
              user_id: userId,
              type: notificationType,
              title: notificationTitle,
              message: notificationMessage,
              seen: false,
              data: transaction
            });
            
            // Show toast notification immediately
            toast.info(notificationTitle, {
              description: notificationMessage
            });
            
            console.log('Transaction notification created successfully');
          } catch (error) {
            console.error('Error creating transaction notification:', error);
          }
        }
        
        refreshCallback();
      })
      .subscribe();
      
    // Also subscribe to notifications table to handle new notifications
    const notificationsChannel = supabase
      .channel('notifications_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId} AND seen=eq.false`
      }, (payload) => {
        console.log('New notification received:', payload.new);
        
        // Don't show toast for investment notifications - they're already shown by the confirmation hook
        if (payload.new.type === 'investment') {
          console.log('Skipping duplicate toast for investment notification');
          return;
        }
        
        // Show toast notification
        toast.info(payload.new.title, {
          description: payload.new.message,
          action: {
            label: "Voir détails",
            onClick: () => {
              window.location.href = `/dashboard?tab=notifications`;
            }
          }
        });
      })
      .subscribe();
      
    console.log("Real-time subscriptions set up successfully");
    
    return () => {
      console.log("Cleaning up investment tracking subscriptions");
      if (investmentChannel) supabase.removeChannel(investmentChannel);
      if (walletChannel) supabase.removeChannel(walletChannel);
      if (notificationsChannel) supabase.removeChannel(notificationsChannel);
    };
  }, [userId, refreshCallback]);
};
