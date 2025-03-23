
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentData {
  userId: string;
  amount: number;
  paymentId: string;
  projectName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, amount, paymentId, projectName }: PaymentData = await req.json();

    if (!userId || !amount || !paymentId) {
      return new Response(
        JSON.stringify({ error: "Missing required data for payment processing" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing payment for user ${userId}, amount: ${amount}, paymentId: ${paymentId}`);

    // First check if this payment was already processed
    const { data: existingTransaction, error: checkError } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('payment_id', paymentId)
      .eq('status', 'completed')
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking existing transaction:", checkError);
      throw new Error("Error checking transaction status");
    }
      
    if (existingTransaction) {
      console.log(`Payment ${paymentId} was already processed, skipping`);
      return new Response(
        JSON.stringify({ success: true, message: "Payment already processed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a wallet transaction for the payment
    const { error: txError } = await supabase.from('wallet_transactions').insert({
      user_id: userId,
      amount: amount,
      type: 'yield',
      description: `Rendement automatique: ${projectName || 'Investissement'}`,
      status: 'completed',
      receipt_confirmed: true,
      payment_id: paymentId
    });
    
    if (txError) {
      console.error("Failed to create wallet transaction:", txError);
      throw new Error("Failed to create transaction record");
    }
    
    // Update wallet balance directly using RPC function
    const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
      user_id: userId,
      increment_amount: amount
    });
    
    if (balanceError) {
      console.error("Failed to update wallet balance:", balanceError);
      throw new Error("Failed to update wallet balance");
    }

    // Send notification to the user
    await sendYieldNotification(supabase, userId, amount, projectName || 'Investissement');

    // Process referral commission (10% to the referrer)
    await processReferralCommission(supabase, userId, amount, projectName || 'Investissement');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed payment of ${amount}€ for user ${userId}` 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in update-wallet-on-payment function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to send yield notification
async function sendYieldNotification(supabase, userId, amount, projectName) {
  try {
    // Get user data for notification
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email, first_name')
      .eq('id', userId)
      .single();
      
    if (userError || !userData) {
      console.error('Error fetching user data for notification:', userError);
      return;
    }
    
    // Create a notification in the database
    await supabase.from('notifications').insert({
      user_id: userId,
      title: "Rendement reçu",
      message: `Vous avez reçu ${amount}€ de rendement pour votre investissement dans ${projectName}.`,
      type: "yield",
      data: {
        category: "transaction",
        amount: amount,
        projectName: projectName,
        status: "completed"
      },
      seen: false
    });
    
    console.log(`Notification created for user ${userId} for yield of ${amount}€`);
  } catch (error) {
    console.error("Error sending yield notification:", error);
  }
}

// Helper function to process referral commission
async function processReferralCommission(supabase, userId, yieldAmount, projectName) {
  try {
    // First check if this user has a referrer
    const { data: referralData, error: referralError } = await supabase
      .from('referrals')
      .select('id, referrer_id')
      .eq('referred_id', userId)
      .single();
      
    if (referralError) {
      if (referralError.code !== 'PGRST116') { // Not found
        console.error("Error checking referral:", referralError);
      }
      return; // No referrer or error
    }
    
    if (!referralData || !referralData.referrer_id) {
      return; // No referrer found
    }
    
    // Calculate 10% commission
    const commissionAmount = Math.round(yieldAmount * 0.1);
    console.log(`Processing ${commissionAmount}€ commission for referrer ${referralData.referrer_id}`);
    
    if (commissionAmount <= 0) {
      return; // No commission to pay
    }
    
    // Create a wallet transaction for the commission
    const { error: txError } = await supabase.from('wallet_transactions').insert({
      user_id: referralData.referrer_id,
      amount: commissionAmount,
      type: 'commission',
      description: `Commission de parrainage (10%)`,
      status: 'completed',
      receipt_confirmed: true
    });
    
    if (txError) {
      console.error("Failed to create commission transaction:", txError);
      return;
    }
    
    // Update referrer's wallet balance
    const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
      user_id: referralData.referrer_id,
      increment_amount: commissionAmount
    });
    
    if (balanceError) {
      console.error("Failed to update referrer wallet balance:", balanceError);
      return;
    }
    
    // Create a notification for the referrer
    const { error: notificationError } = await supabase.from('notifications').insert({
      user_id: referralData.referrer_id,
      title: "Commission de parrainage reçue",
      message: `Vous avez reçu ${commissionAmount}€ de commission sur le rendement de votre filleul.`,
      type: "commission",
      data: {
        category: "transaction",
        amount: commissionAmount,
        status: "completed"
      },
      seen: false
    });
    
    if (notificationError) {
      console.error("Failed to create commission notification:", notificationError);
    }
    
    console.log(`Successfully processed ${commissionAmount}€ commission for referrer ${referralData.referrer_id}`);
  } catch (error) {
    console.error("Error processing referral commission:", error);
  }
}
