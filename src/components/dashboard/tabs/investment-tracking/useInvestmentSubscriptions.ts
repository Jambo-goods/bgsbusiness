
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notificationService } from "@/services/notifications";

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
        
        // Vérifier si le statut change à "completed" pour envoyer la notification de projet terminé
        if (payload.eventType === 'UPDATE' && payload.new.status === 'completed' && payload.old.status !== 'completed') {
          try {
            console.log("Projet terminé, création de la notification");
            // Récupérer les informations du projet
            const { data: projectData } = await supabase
              .from('projects')
              .select('name')
              .eq('id', payload.new.project_id)
              .single();
              
            if (projectData) {
              await notificationService.projectCompleted(projectData.name, payload.new.project_id);
              console.log("Notification de projet terminé créée avec succès");
            }
          } catch (error) {
            console.error("Erreur lors de la création de la notification de projet terminé:", error);
          }
        }
        
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
        
        // Si c'est une transaction de type 'yield', déclencher la notification de profit reçu
        if (payload.eventType === 'INSERT' && 
            payload.new.type === 'yield' && 
            payload.new.status === 'completed' && 
            payload.new.amount > 0) {
          try {
            // Le format de description attendu est "Rendement pour [nom du projet]"
            // ou tout autre format contenant les informations nécessaires
            const description = payload.new.description || "";
            const projectNameMatch = description.match(/pour (.+)$/);
            
            if (projectNameMatch && projectNameMatch[1]) {
              const projectName = projectNameMatch[1];
              console.log("Profit reçu, création de la notification");
              
              // Récupérer l'ID du projet
              const { data: projectData } = await supabase
                .from('projects')
                .select('id')
                .eq('name', projectName)
                .single();
                
              if (projectData) {
                await notificationService.profitReceived(
                  payload.new.amount,
                  projectName,
                  projectData.id
                );
                console.log("Notification de profit reçu créée avec succès");
              }
            }
          } catch (error) {
            console.error("Erreur lors de la création de la notification de profit reçu:", error);
          }
        }
        
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
