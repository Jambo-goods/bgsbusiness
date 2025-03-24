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
  projectId?: string;
  percentage?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, amount, paymentId, projectName, projectId, percentage }: PaymentData = await req.json();

    if (!userId || !amount || !paymentId) {
      return new Response(
        JSON.stringify({ error: "Missing required data for payment processing" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing yield payment for user ${userId}, amount: ${amount}, paymentId: ${paymentId}`);

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

    let projectDetails;
    if (projectId) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('name, company_name')
        .eq('id', projectId)
        .single();
        
      if (!projectError && project) {
        projectDetails = project;
      }
    }
    
    const actualProjectName = projectDetails?.name || projectName || 'Investissement';

    const { data: transaction, error: txError } = await supabase.from('wallet_transactions').insert({
      user_id: userId,
      amount: amount,
      type: 'yield',
      description: `Rendement automatique: ${actualProjectName}`,
      status: 'completed',
      receipt_confirmed: true,
      payment_id: paymentId
    }).select().single();
    
    if (txError) {
      console.error("Failed to create wallet transaction:", txError);
      throw new Error("Failed to create transaction record");
    }
    
    console.log("Created yield wallet transaction:", transaction.id);
    
    const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
      user_id: userId,
      increment_amount: amount
    });
    
    if (balanceError) {
      console.error("Failed to update wallet balance:", balanceError);
      throw new Error("Failed to update wallet balance");
    }

    await sendYieldNotification(supabase, userId, amount, actualProjectName);

    await processReferralCommission(supabase, userId, amount, actualProjectName, paymentId);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed yield payment of ${amount}€ for user ${userId}` 
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

async function sendYieldNotification(supabase, userId, amount, projectName) {
  try {
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email, first_name')
      .eq('id', userId)
      .single();
      
    if (userError || !userData) {
      console.error('Error fetching user data for notification:', userError);
      return;
    }
    
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

async function processReferralCommission(supabase, userId, paymentAmount, projectName, paymentId) {
  try {
    console.log(`Checking for referral relationship for user ${userId}`);
    
    const { data: referralData, error: referralError } = await supabase
      .from('referrals')
      .select('id, referrer_id, status, commission_rate, total_commission')
      .eq('referred_id', userId)
      .single();
      
    if (referralError) {
      if (referralError.code !== 'PGRST116') { // Not found
        console.error("Error checking referral:", referralError);
      }
      console.log(`No referrer found for user ${userId}, skipping commission`);
      return; // No referrer or error
    }
    
    if (!referralData || !referralData.referrer_id) {
      console.log(`No referrer found for user ${userId}, skipping commission`);
      return; // No referrer found
    }

    if (referralData.status !== 'valid') {
      console.log(`Referral for user ${userId} has status ${referralData.status}, not valid, skipping commission`);
      return;
    }
    
    const commissionRate = referralData.commission_rate ? referralData.commission_rate / 100 : 0.1;
    const commissionAmount = Math.round(paymentAmount * commissionRate * 100) / 100;
    
    console.log(`Processing ${commissionAmount}€ commission (${commissionRate * 100}% of ${paymentAmount}€ payment) for referrer ${referralData.referrer_id}`);
    
    if (commissionAmount <= 0) {
      console.log(`Commission amount ${commissionAmount} is too small, skipping`);
      return; // No commission to pay
    }
    
    const { data: existingCommission, error: checkCommissionError } = await supabase
      .from('referral_commissions')
      .select('id')
      .eq('referrer_id', referralData.referrer_id)
      .eq('referred_id', userId)
      .eq('payment_id', paymentId)
      .maybeSingle();
      
    if (checkCommissionError) {
      console.error("Error checking existing commission:", checkCommissionError);
    } else if (existingCommission) {
      console.log(`Commission for payment ${paymentId} already processed, skipping`);
      return;
    }
    
    const { data: commissionData, error: commissionError } = await supabase.from('referral_commissions').insert({
      referral_id: referralData.id,
      referrer_id: referralData.referrer_id,
      referred_id: userId,
      amount: commissionAmount,
      source: 'investment_payment',
      status: 'completed',
      payment_id: paymentId
    }).select().single();
    
    if (commissionError) {
      console.error("Failed to create referral commission record:", commissionError);
      return;
    }
    
    console.log(`Created referral commission record: ${commissionData.id}`);
    
    const { data: transaction, error: txError } = await supabase.from('wallet_transactions').insert({
      user_id: referralData.referrer_id,
      amount: commissionAmount,
      type: 'commission',
      description: `Commission de parrainage (10% du rendement)`,
      status: 'completed',
      receipt_confirmed: true,
      payment_id: paymentId
    }).select().single();
    
    if (txError) {
      console.error("Failed to create commission transaction:", txError);
      return;
    }

    console.log(`Created commission wallet transaction: ${transaction.id}`);
    
    const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
      user_id: referralData.referrer_id,
      increment_amount: commissionAmount
    });
    
    if (balanceError) {
      console.error("Failed to update referrer wallet balance:", balanceError);
      return;
    }
    
    const totalCommission = (referralData.total_commission || 0) + commissionAmount;
    const { error: updateError } = await supabase
      .from('referrals')
      .update({ 
        total_commission: totalCommission 
      })
      .eq('id', referralData.id);
    
    if (updateError) {
      console.error("Failed to update referral record:", updateError);
      return;
    }
    
    const { error: notificationError } = await supabase.from('notifications').insert({
      user_id: referralData.referrer_id,
      title: "Commission de parrainage reçue",
      message: `Vous avez reçu ${commissionAmount}€ de commission sur le rendement de votre filleul.`,
      type: "commission",
      data: {
        category: "transaction",
        amount: commissionAmount,
        status: "completed",
        payment_id: paymentId
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
