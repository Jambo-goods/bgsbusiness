
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Get all completed wallet transactions of type 'yield'
    const { data: yieldTransactions, error: yieldError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('type', 'yield')
      .eq('status', 'completed');
      
    if (yieldError) {
      throw new Error(`Error fetching yield transactions: ${yieldError.message}`);
    }
    
    console.log(`Found ${yieldTransactions?.length || 0} yield transactions to process`);
    
    // Array to store results
    const results = {
      processedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      details: []
    };

    // Process each yield transaction
    for (const transaction of yieldTransactions || []) {
      try {
        const userId = transaction.user_id;
        const amount = transaction.amount;
        const paymentId = transaction.payment_id || transaction.id; // Fallback to transaction ID if payment_id is not set
        
        // Skip if no user or amount
        if (!userId || !amount) {
          results.skippedCount++;
          results.details.push({
            transactionId: transaction.id,
            status: 'skipped',
            reason: 'Missing userId or amount'
          });
          continue;
        }
        
        // Check if this user has a referrer
        const { data: referralData, error: referralError } = await supabase
          .from('referrals')
          .select('id, referrer_id, status, total_commission')
          .eq('referred_id', userId)
          .single();
          
        if (referralError || !referralData || !referralData.referrer_id) {
          results.skippedCount++;
          results.details.push({
            transactionId: transaction.id,
            status: 'skipped',
            reason: 'No valid referral relationship found'
          });
          continue;
        }

        // Skip if referral status is not valid
        if (referralData.status !== 'valid') {
          results.skippedCount++;
          results.details.push({
            transactionId: transaction.id,
            status: 'skipped',
            reason: `Referral status is ${referralData.status}, not valid`
          });
          continue;
        }
        
        // Check if we already have a commission for this payment
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
          results.skippedCount++;
          results.details.push({
            transactionId: transaction.id,
            status: 'skipped',
            reason: 'Commission already exists'
          });
          continue;
        }
        
        // Calculate 10% commission
        const commissionAmount = Math.round(amount * 0.1 * 100) / 100; // Round to 2 decimal places
        
        if (commissionAmount <= 0) {
          results.skippedCount++;
          results.details.push({
            transactionId: transaction.id,
            status: 'skipped',
            reason: 'Commission amount too small'
          });
          continue;
        }
        
        // Create a wallet transaction for the commission
        const { data: commissionTransaction, error: txError } = await supabase.from('wallet_transactions').insert({
          user_id: referralData.referrer_id,
          amount: commissionAmount,
          type: 'commission',
          description: `Commission de parrainage (10%) - correction rétroactive`,
          status: 'completed',
          receipt_confirmed: true,
          payment_id: paymentId
        }).select().single();
        
        if (txError) {
          results.failedCount++;
          results.details.push({
            transactionId: transaction.id,
            status: 'failed',
            reason: `Failed to create commission transaction: ${txError.message}`
          });
          continue;
        }

        // Update referrer's wallet balance
        const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
          user_id: referralData.referrer_id,
          increment_amount: commissionAmount
        });
        
        if (balanceError) {
          results.failedCount++;
          results.details.push({
            transactionId: transaction.id,
            status: 'failed',
            reason: `Failed to update referrer wallet balance: ${balanceError.message}`
          });
          continue;
        }
        
        // Create a record in referral_commissions table
        const { data: commissionData, error: commissionError } = await supabase.from('referral_commissions').insert({
          referral_id: referralData.id,
          referrer_id: referralData.referrer_id,
          referred_id: userId,
          amount: commissionAmount,
          source: 'investment_yield',
          status: 'completed',
          payment_id: paymentId
        }).select().single();
        
        if (commissionError) {
          results.failedCount++;
          results.details.push({
            transactionId: transaction.id,
            status: 'failed',
            reason: `Failed to create referral commission record: ${commissionError.message}`
          });
          continue;
        }
        
        // Update total commission in referral record
        const totalCommission = (referralData.total_commission || 0) + commissionAmount;
        const { error: updateError } = await supabase
          .from('referrals')
          .update({ 
            total_commission: totalCommission 
          })
          .eq('id', referralData.id);
        
        if (updateError) {
          results.failedCount++;
          results.details.push({
            transactionId: transaction.id,
            status: 'failed',
            reason: `Failed to update referral record: ${updateError.message}`
          });
          continue;
        }
        
        // Create a notification for the referrer
        const { error: notificationError } = await supabase.from('notifications').insert({
          user_id: referralData.referrer_id,
          title: "Commission de parrainage reçue",
          message: `Vous avez reçu ${commissionAmount}€ de commission sur le rendement de votre filleul (correction rétroactive).`,
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
          // Continue anyway, this is not critical
        }
        
        results.processedCount++;
        results.details.push({
          transactionId: transaction.id,
          status: 'success',
          commission: commissionAmount,
          referrerId: referralData.referrer_id
        });
        
        console.log(`Processed retroactive commission of ${commissionAmount}€ for transaction ${transaction.id}`);
      } catch (err) {
        console.error(`Error processing transaction ${transaction.id}:`, err);
        results.failedCount++;
        results.details.push({
          transactionId: transaction.id,
          status: 'failed',
          reason: err.message || 'Unknown error'
        });
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${results.processedCount} retroactive commissions, skipped ${results.skippedCount}, failed ${results.failedCount}`,
        results
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in fix-referral-commissions function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
