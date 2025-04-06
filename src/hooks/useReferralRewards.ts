
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notifications";
import { toast } from "sonner";

/**
 * Hook to handle automatic referral rewards when a user makes their first investment
 */
export function useReferralRewards() {
  useEffect(() => {
    // Fonction pour vérifier et attribuer les récompenses de parrainage
    const checkAndProcessReferralRewards = async () => {
      // Récupérer l'ID de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      try {
        // Vérifier si l'utilisateur est un filleul
        const { data: referral, error: referralError } = await supabase
          .from('referrals')
          .select('id, referrer_id, status, referrer_rewarded')
          .eq('referred_id', user.id)
          .eq('status', 'pending')
          .single();
          
        if (referralError || !referral) {
          // L'utilisateur n'est pas un filleul ou le parrainage est déjà complété
          return;
        }
        
        // Vérifier si l'utilisateur a déjà fait un investissement
        const { data: investments, error: investmentsError } = await supabase
          .from('investments')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
          
        if (investmentsError) {
          console.error("Erreur lors de la vérification des investissements:", investmentsError);
          return;
        }
        
        // Si l'utilisateur a au moins un investissement et que le parrainage est en attente
        if (investments && investments.length > 0) {
          // Marquer le parrainage comme complété
          const { error: updateError } = await supabase
            .from('referrals')
            .update({ 
              status: 'completed',
              referrer_rewarded: true
            })
            .eq('id', referral.id);
            
          if (updateError) {
            console.error("Erreur lors de la mise à jour du statut du parrainage:", updateError);
            return;
          }
          
          // Ajouter le bonus au parrain
          const { error: transactionError } = await supabase
            .from('wallet_transactions')
            .insert([{
              user_id: referral.referrer_id,
              amount: 25,
              type: 'referral_bonus',
              description: `Bonus de parrainage - Premier investissement de ${user.user_metadata?.first_name || 'votre filleul'}`,
              status: 'completed'
            }]);
            
          if (transactionError) {
            console.error("Erreur lors de l'ajout du bonus au parrain:", transactionError);
            return;
          }
          
          // Mettre à jour le solde du parrain
          const { error: balanceError } = await supabase.rpc(
            'increment_wallet_balance',
            { user_id: referral.referrer_id, increment_amount: 25 }
          );
          
          if (balanceError) {
            console.error("Erreur lors de la mise à jour du solde du parrain:", balanceError);
            return;
          }
          
          // Envoyer une notification au parrain
          try {
            await notificationService.createNotification({
              userId: referral.referrer_id,
              title: "Bonus de parrainage reçu !",
              description: `Votre filleul a fait son premier investissement. 25€ ont été crédités sur votre compte.`,
              type: "referral",
              category: "success"
            });
          } catch (notifError) {
            console.error("Erreur lors de l'envoi de la notification:", notifError);
          }
        }
      } catch (error) {
        console.error("Erreur lors du traitement des récompenses de parrainage:", error);
      }
    };

    // Vérifier immédiatement lors du montage du composant
    checkAndProcessReferralRewards();
    
    // Écouter les changements dans la table des investissements
    const investmentsChannel = supabase
      .channel('track-investments-for-referrals')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'investments' },
        (payload) => {
          // Traiter les récompenses de parrainage lorsqu'un nouvel investissement est créé
          checkAndProcessReferralRewards();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(investmentsChannel);
    };
  }, []);

  return null; // Ce hook n'expose aucune valeur, il effectue uniquement des effets de bord
}
