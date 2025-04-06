
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") as string,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
    );
    
    const { referralId, userId } = await req.json();
    
    if (!referralId) {
      return new Response(
        JSON.stringify({ error: "Missing referral ID" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Récupérer les informations du parrainage
    const { data: referral, error: referralError } = await supabaseClient
      .from('referrals')
      .select('id, referrer_id, referred_id, status, referrer_rewarded')
      .eq('id', referralId)
      .single();
      
    if (referralError || !referral) {
      return new Response(
        JSON.stringify({ error: "Referral not found", details: referralError }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Vérifier si le parrainage est déjà complété
    if (referral.status === 'completed' && referral.referrer_rewarded) {
      return new Response(
        JSON.stringify({ message: "Referral already completed", status: referral.status }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Mettre à jour le statut du parrainage
    const { error: updateError } = await supabaseClient
      .from('referrals')
      .update({
        status: 'completed',
        referrer_rewarded: true
      })
      .eq('id', referralId);
      
    if (updateError) {
      throw updateError;
    }
    
    // Ajouter le bonus de 25€ au parrain
    const { error: transactionError } = await supabaseClient
      .from('wallet_transactions')
      .insert([{
        user_id: referral.referrer_id,
        amount: 25,
        type: 'referral_bonus',
        description: 'Bonus de parrainage - Premier investissement de votre filleul',
        status: 'completed'
      }]);
      
    if (transactionError) {
      throw transactionError;
    }
    
    // Mettre à jour le solde du parrain
    await supabaseClient
      .rpc('increment_wallet_balance', {
        user_id: referral.referrer_id,
        increment_amount: 25
      });
      
    // Récupérer les informations du parrain pour la notification
    const { data: referrerData } = await supabaseClient
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', referral.referrer_id)
      .single();
      
    // Créer une notification pour le parrain
    await supabaseClient
      .from('notifications')
      .insert([{
        user_id: referral.referrer_id,
        title: "Félicitations ! Bonus de parrainage reçu",
        message: `Votre filleul a fait son premier investissement. 25€ ont été crédités sur votre compte.`,
        type: "referral",
        data: {
          category: "success",
          amount: 25
        }
      }]);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Referral reward processed", 
        referralId, 
        referrerName: referrerData ? `${referrerData.first_name} ${referrerData.last_name}` : "Unknown" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error processing referral reward:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
