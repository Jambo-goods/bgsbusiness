
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { userId, investmentData } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: "User ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Get the supabase client with admin privileges
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if this user was referred by someone
    const { data: referralData, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_id', userId)
      .eq('status', 'pending')
      .eq('referrer_rewarded', false)
      .single();
      
    if (referralError && referralError.code !== 'PGRST116') { // Not found is fine
      console.error("Error checking for referrals:", referralError);
      return new Response(
        JSON.stringify({ success: false, message: `Error checking referrals: ${referralError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // If no referral found, nothing to do
    if (!referralData) {
      return new Response(
        JSON.stringify({ success: true, message: "No pending referral found for this user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log("Found pending referral:", referralData);

    // Get referrer information for notification
    const { data: referrerData, error: referrerError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', referralData.referrer_id)
      .single();
    
    if (referrerError) {
      console.error("Error fetching referrer profile:", referrerError);
      return new Response(
        JSON.stringify({ success: false, message: `Error fetching referrer: ${referrerError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Get referred user information
    const { data: referredData, error: referredError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (referredError) {
      console.error("Error fetching referred profile:", referredError);
      return new Response(
        JSON.stringify({ success: false, message: `Error fetching referred user: ${referredError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Process the reward
    const { data: rewardResult, error: rewardError } = await supabase
      .rpc('add_referral_reward', {
        user_id_param: referralData.referrer_id,
        amount_param: 25,
        description_param: `Récompense parrainage (filleul : ${referredData.first_name} ${referredData.last_name})`
      });
      
    if (rewardError) {
      console.error("Error adding referral reward:", rewardError);
      return new Response(
        JSON.stringify({ success: false, message: `Error adding reward: ${rewardError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Create notification for the referrer
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: referralData.referrer_id,
        title: '🎉 Parrainage réussi !',
        message: `Votre filleul ${referredData.first_name} ${referredData.last_name} vient d'investir. Vous avez gagné une récompense de 25 €.`,
        type: 'referral',
        data: {
          category: 'success',
          amount: 25,
          referredName: `${referredData.first_name} ${referredData.last_name}`
        }
      });
      
    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Continue even if notification fails
    }
    
    // Update referral status
    const { error: updateError } = await supabase
      .from('referrals')
      .update({
        status: 'completed',
        referrer_rewarded: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', referralData.id);
      
    if (updateError) {
      console.error("Error updating referral status:", updateError);
      return new Response(
        JSON.stringify({ success: false, message: `Error updating referral: ${updateError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Referral reward processed successfully",
        reward: {
          amount: 25,
          referrerId: referralData.referrer_id,
          referrerName: `${referrerData.first_name} ${referrerData.last_name}`,
          referredName: `${referredData.first_name} ${referredData.last_name}`
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
