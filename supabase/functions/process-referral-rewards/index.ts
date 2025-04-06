
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

console.log("Process referral rewards function started");

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth admin key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { user_id, investment_id } = await req.json();
    
    if (!user_id || !investment_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required parameters" 
        }),
        { 
          headers: { "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    console.log(`Processing referral rewards for user: ${user_id}, investment: ${investment_id}`);
    
    // Check if this is the user's first investment
    const { data: investments, error: investmentsError } = await supabaseAdmin
      .from('investments')
      .select('id')
      .eq('user_id', user_id);
      
    if (investmentsError) {
      throw investmentsError;
    }
    
    if (!investments || investments.length !== 1) {
      console.log(`Not the user's first investment or error fetching investments. Count: ${investments?.length}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          processed: false,
          reason: "Not the user's first investment"
        }),
        { 
          headers: { "Content-Type": "application/json" },
          status: 200
        }
      );
    }
    
    // Find the referral record for this user
    const { data: referral, error: referralError } = await supabaseAdmin
      .from('referrals')
      .select('id, referrer_id, referrer_rewarded')
      .eq('referred_id', user_id)
      .single();
      
    if (referralError) {
      console.log("No referral found for this user");
      return new Response(
        JSON.stringify({ 
          success: false, 
          processed: false,
          reason: "No referral found"
        }),
        { 
          headers: { "Content-Type": "application/json" },
          status: 200
        }
      );
    }
    
    // If the referrer has already been rewarded, do nothing
    if (referral.referrer_rewarded) {
      console.log("Referrer already rewarded");
      return new Response(
        JSON.stringify({ 
          success: false, 
          processed: false,
          reason: "Referrer already rewarded"
        }),
        { 
          headers: { "Content-Type": "application/json" },
          status: 200
        }
      );
    }
    
    // Get the user's profile to use their name in the notification
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user_id)
      .single();
      
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
    }
    
    const referredName = profile ? 
      `${profile.first_name} ${profile.last_name || ''}`.trim() : 
      'Un filleul';
    
    // Award the referrer with the bonus and update the referral status
    try {
      // Start a transaction
      // TODO: In production, use a better transaction mechanism - this is a simplified version
      
      // 1. Update the referral record
      const { error: updateError } = await supabaseAdmin
        .from('referrals')
        .update({ 
          referrer_rewarded: true,
          status: 'completed'
        })
        .eq('id', referral.id);
        
      if (updateError) throw updateError;
      
      // 2. Add the reward transaction to the referrer's wallet
      const { error: rewardError } = await supabaseAdmin.rpc('add_referral_reward', {
        user_id_param: referral.referrer_id,
        amount_param: 25,
        description_param: `Récompense parrainage (filleul : ${referredName})`
      });
      
      if (rewardError) throw rewardError;
      
      // 3. Create a notification for the referrer
      const { error: notifError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: referral.referrer_id,
          title: '🎉 Parrainage réussi !',
          message: `Votre filleul ${referredName} vient d'investir. Vous avez gagné une récompense de 25 €.`,
          type: 'referral',
          data: {
            category: 'success',
            amount: 25,
            referredName
          }
        });
        
      if (notifError) throw notifError;
      
      console.log("Successfully processed referral reward");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: true,
          referrer_id: referral.referrer_id,
          referral_id: referral.id
        }),
        { 
          headers: { "Content-Type": "application/json" },
          status: 200
        }
      );
    } catch (error) {
      console.error("Error processing referral reward:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message
        }),
        { 
          headers: { "Content-Type": "application/json" },
          status: 500
        }
      );
    }
  } catch (error) {
    console.error("Fatal error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
