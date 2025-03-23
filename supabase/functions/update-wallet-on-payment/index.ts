
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

    // Vérifier que la date de paiement est valide
    if (!record.payment_date) {
      console.error('Error: payment_date is missing or null');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "La date de paiement est obligatoire" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

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
      const totalInvestedAmount = record.total_invested_amount || 
        investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
      
      // Utiliser directement le pourcentage stocké dans la colonne percentage
      const percentageToDistribute = record.percentage || 0;
      console.log(`Distribution percentage: ${percentageToDistribute}%`);
      
      // Pour chaque investisseur, mettre à jour son solde de portefeuille
      for (const investment of investments || []) {
        try {
          // Calculer le pourcentage de l'investissement par rapport au total
          const investmentPercentage = totalInvestedAmount > 0 
            ? investment.amount / totalInvestedAmount 
            : 0;
          
          // Calculer le montant à ajouter au portefeuille de l'investisseur
          // Basé sur le pourcentage spécifié dans le scheduled_payment
          const investmentAmount = investment.amount;
          // Direct calculation based on investment amount and yield percentage
          const amountToAdd = Math.round((investmentAmount * percentageToDistribute) / 100);
          
          console.log(`Adding ${amountToAdd} to user ${investment.user_id} wallet (${percentageToDistribute}% of ${investmentAmount})`);

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
                status: 'completed',
                description: `Rendement reçu de ${projectName} - ${new Date(record.payment_date).toLocaleDateString('fr-FR')} (${percentageToDistribute}%)`
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
                  paymentDate: record.payment_date,
                  percentage: percentageToDistribute
                }
              });

            if (notificationError) {
              console.error(`Error creating notification for user ${investment.user_id}:`, notificationError);
            }
          }
        } catch (processError) {
          console.error(`Error processing investment for user ${investment.user_id}:`, processError);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Wallet balances updated successfully",
          updatedCount: investments?.length || 0 
        }),
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
