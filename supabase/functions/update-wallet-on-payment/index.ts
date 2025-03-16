
// Fonction pour mettre à jour le solde du portefeuille quand un paiement programmé est marqué comme payé
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Récupérer les variables d'environnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Créer un client Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // Analyser le corps de la requête
    const { record, old_record } = await req.json();

    console.log('Scheduled payment update received:', { new: record, old: old_record });

    // Vérifier si le statut a changé en "paid"
    if (record && old_record && record.status === 'paid' && old_record.status !== 'paid') {
      // Récupérer les détails du projet
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('name')
        .eq('id', record.project_id)
        .single();

      if (projectError) {
        console.error('Error getting project details:', projectError);
      }

      const projectName = projectData?.name || 'Projet';

      // Si le paiement a été effectué, mettre à jour le solde du portefeuille de chaque investisseur
      // Récupérer tous les investissements pour ce projet
      const { data: investments, error: investmentsError } = await supabase
        .from('investments')
        .select('user_id, amount')
        .eq('project_id', record.project_id)
        .eq('status', 'active');

      if (investmentsError) {
        console.error('Error fetching investments:', investmentsError);
        throw new Error('Error fetching investments');
      }

      // Calculer le montant à ajouter au portefeuille de chaque investisseur
      const totalInvestedAmount = record.total_invested_amount || 0;
      const totalScheduledAmount = record.total_scheduled_amount || 0;

      console.log(`Processing payment for project: ${projectName}`);
      console.log(`Total invested amount: ${totalInvestedAmount}, Total scheduled amount: ${totalScheduledAmount}`);
      console.log(`Found ${investments?.length || 0} active investments for this project`);

      // Pour chaque investisseur, mettre à jour son solde de portefeuille
      for (const investment of investments || []) {
        // Calculer le pourcentage de l'investissement par rapport au total
        const investmentPercentage = totalInvestedAmount > 0 
          ? investment.amount / totalInvestedAmount 
          : 0;
        
        // Calculer le montant à ajouter au portefeuille de l'investisseur
        const amountToAdd = Math.round(totalScheduledAmount * investmentPercentage);
        
        console.log(`Adding ${amountToAdd} to user ${investment.user_id} wallet (${investmentPercentage * 100}% of total)`);

        if (amountToAdd > 0) {
          // Mettre à jour le solde du portefeuille
          const { error: walletError } = await supabase.rpc(
            'increment_wallet_balance',
            {
              user_id: investment.user_id,
              increment_amount: amountToAdd
            }
          );

          if (walletError) {
            console.error(`Error updating wallet balance for user ${investment.user_id}:`, walletError);
            continue;
          }

          // Créer une transaction de portefeuille
          const { error: transactionError } = await supabase
            .from('wallet_transactions')
            .insert({
              user_id: investment.user_id,
              amount: amountToAdd,
              type: 'yield',
              description: `Rendement reçu de ${projectName} - ${new Date(record.payment_date).toLocaleDateString('fr-FR')}`
            });

          if (transactionError) {
            console.error(`Error creating wallet transaction for user ${investment.user_id}:`, transactionError);
          }

          // Créer une notification
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: investment.user_id,
              title: "Rendement reçu",
              message: `Vous avez reçu ${amountToAdd}€ de rendement pour votre investissement dans ${projectName}.`,
              type: 'yield',
              data: {
                amount: amountToAdd,
                projectId: record.project_id,
                projectName: projectName,
                paymentDate: record.payment_date
              }
            });

          if (notificationError) {
            console.error(`Error creating notification for user ${investment.user_id}:`, notificationError);
          }
          
          // Vérifier si cet utilisateur a été parrainé et si c'est son premier rendement
          // Si c'est le cas, mettre à jour le statut du parrainage à "completed" et donner la commission
          const { data: referralData, error: referralError } = await supabase
            .from('referrals')
            .select('*')
            .eq('referred_id', investment.user_id)
            .eq('status', 'pending')
            .maybeSingle();
            
          if (!referralError && referralData) {
            console.log(`Found pending referral for user ${investment.user_id}, updating status to completed`);
            
            // Mise à jour du statut du parrainage
            const { error: updateError } = await supabase
              .from('referrals')
              .update({ status: 'completed' })
              .eq('id', referralData.id);
              
            if (updateError) {
              console.error(`Error updating referral status:`, updateError);
            } else {
              // Ajouter la commission de 25€ au portefeuille du parrain
              const { error: commissionError } = await supabase.rpc(
                'increment_wallet_balance',
                {
                  user_id: referralData.referrer_id,
                  increment_amount: 25
                }
              );
              
              if (commissionError) {
                console.error(`Error adding commission to referrer ${referralData.referrer_id}:`, commissionError);
              } else {
                // Créer une transaction pour la commission
                const { error: commissionTxError } = await supabase
                  .from('wallet_transactions')
                  .insert({
                    user_id: referralData.referrer_id,
                    amount: 25,
                    type: 'referral',
                    description: `Commission de parrainage`
                  });
                  
                if (commissionTxError) {
                  console.error(`Error creating commission transaction:`, commissionTxError);
                }
                
                // Créer une notification pour le parrain
                const { error: commissionNotifError } = await supabase
                  .from('notifications')
                  .insert({
                    user_id: referralData.referrer_id,
                    title: "Commission de parrainage reçue",
                    message: `Vous avez reçu 25€ de commission pour votre parrainage.`,
                    type: 'referral',
                    data: {
                      amount: 25,
                      referredId: investment.user_id
                    }
                  });
                  
                if (commissionNotifError) {
                  console.error(`Error creating commission notification:`, commissionNotifError);
                }
              }
            }
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: "Wallet balances updated successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "No action required" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
