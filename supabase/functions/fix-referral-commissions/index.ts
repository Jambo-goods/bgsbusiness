
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
    
    console.log("Starting fix-referral-commissions function");
    
    // Get all paid yield payments that don't have corresponding commissions
    const { data: payments, error: paymentsError } = await supabase
      .from('scheduled_payments')
      .select(`
        id,
        project_id,
        total_scheduled_amount,
        percentage,
        projects:project_id (name)
      `)
      .eq('status', 'paid');
      
    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
      throw new Error(`Error fetching payments: ${paymentsError.message}`);
    }
    
    console.log(`Found ${payments?.length || 0} paid payments to check`);
    
    // Process results
    const results = {
      processedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      details: [] as any[]
    };
    
    // Process each payment
    for (const payment of payments || []) {
      try {
        const paymentId = payment.id;
        const amount = payment.total_scheduled_amount || 0;
        
        if (!paymentId || amount <= 0) {
          console.log(`Skipping payment with invalid data: ${paymentId}, amount: ${amount}`);
          results.skippedCount++;
          results.details.push({
            transactionId: paymentId || 'unknown',
            status: 'skipped',
            reason: 'Invalid payment data'
          });
          continue;
        }
        
        // Get all investment transactions for this payment
        const { data: transactions, error: txError } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('payment_id', paymentId)
          .eq('type', 'yield');
        
        if (txError) {
          console.error(`Error fetching transactions for payment ${paymentId}:`, txError);
          results.failedCount++;
          results.details.push({
            transactionId: paymentId,
            status: 'failed',
            reason: `Error fetching transactions: ${txError.message}`
          });
          continue;
        }
        
        console.log(`Found ${transactions?.length || 0} transactions for payment ${paymentId}`);
        
        // If no transactions, skip
        if (!transactions || transactions.length === 0) {
          console.log(`No transactions found for payment ${paymentId}`);
          results.skippedCount++;
          results.details.push({
            transactionId: paymentId,
            status: 'skipped',
            reason: 'No yield transactions found'
          });
          continue;
        }
        
        // Process each transaction
        for (const transaction of transactions) {
          try {
            const userId = transaction.user_id;
            const txAmount = transaction.amount;
            
            // Check for existing commission for this transaction
            const { data: existingCommission, error: checkError } = await supabase
              .from('referral_commissions')
              .select('id')
              .eq('payment_id', paymentId)
              .eq('referred_id', userId)
              .maybeSingle();
              
            if (checkError) {
              console.error(`Error checking existing commission for user ${userId}:`, checkError);
              continue; // Continue with next transaction
            }
            
            if (existingCommission) {
              console.log(`Commission already exists for user ${userId} and payment ${paymentId}`);
              results.skippedCount++;
              results.details.push({
                transactionId: paymentId,
                status: 'skipped',
                reason: `Commission already exists for user ${userId}`
              });
              continue;
            }
            
            // Find referrer for this user
            const { data: referralData, error: referralError } = await supabase
              .from('referrals')
              .select('id, referrer_id, status, total_commission')
              .eq('referred_id', userId)
              .eq('status', 'valid')
              .maybeSingle();
              
            if (referralError) {
              console.error(`Error finding referral for user ${userId}:`, referralError);
              continue; // Continue with next transaction
            }
            
            if (!referralData || !referralData.referrer_id) {
              console.log(`No valid referral found for user ${userId}`);
              results.skippedCount++;
              results.details.push({
                transactionId: paymentId,
                status: 'skipped',
                reason: `No valid referral found for user ${userId}`
              });
              continue;
            }
            
            // Calculate commission (10%)
            const commissionAmount = Math.round(txAmount * 0.1 * 100) / 100;
            
            if (commissionAmount <= 0) {
              console.log(`Commission amount ${commissionAmount} is too small for user ${userId}`);
              results.skippedCount++;
              results.details.push({
                transactionId: paymentId,
                status: 'skipped',
                reason: `Commission amount is too small: ${commissionAmount}`
              });
              continue;
            }
            
            console.log(`Creating commission of ${commissionAmount} for referrer ${referralData.referrer_id}`);
            
            // Create wallet transaction for commission
            const { data: walletTx, error: walletError } = await supabase
              .from('wallet_transactions')
              .insert({
                user_id: referralData.referrer_id,
                amount: commissionAmount,
                type: 'commission',
                description: `Commission de parrainage (10%)`,
                status: 'completed',
                receipt_confirmed: true,
                payment_id: paymentId
              })
              .select()
              .single();
              
            if (walletError) {
              console.error(`Error creating wallet transaction for referrer ${referralData.referrer_id}:`, walletError);
              results.failedCount++;
              results.details.push({
                transactionId: paymentId,
                status: 'failed',
                reason: `Error creating wallet transaction: ${walletError.message}`
              });
              continue;
            }
            
            // Update referrer's wallet balance
            const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
              user_id: referralData.referrer_id,
              increment_amount: commissionAmount
            });
            
            if (balanceError) {
              console.error(`Error updating wallet balance for referrer ${referralData.referrer_id}:`, balanceError);
              // Continue anyway - the transaction record is created
            }
            
            // Create referral commission record
            const { data: commission, error: commissionError } = await supabase
              .from('referral_commissions')
              .insert({
                referral_id: referralData.id,
                referrer_id: referralData.referrer_id,
                referred_id: userId,
                amount: commissionAmount,
                source: 'investment_yield',
                status: 'completed',
                payment_id: paymentId
              })
              .select()
              .single();
              
            if (commissionError) {
              console.error(`Error creating referral commission record:`, commissionError);
              results.failedCount++;
              results.details.push({
                transactionId: paymentId,
                status: 'failed',
                reason: `Error creating commission record: ${commissionError.message}`
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
              console.error(`Error updating referral record:`, updateError);
              // Continue anyway - the commission record is created
            }
            
            // Send notification to referrer
            try {
              await supabase.from('notifications').insert({
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
            } catch (notifError) {
              console.error("Error creating notification:", notifError);
              // Continue anyway - notification is not critical
            }
            
            results.processedCount++;
            results.details.push({
              transactionId: paymentId,
              status: 'success',
              commission: commissionAmount,
              referrerId: referralData.referrer_id
            });
            
            console.log(`Successfully processed commission for payment ${paymentId}`);
          } catch (txError) {
            console.error(`Error processing transaction for payment ${paymentId}:`, txError);
            results.failedCount++;
            results.details.push({
              transactionId: paymentId,
              status: 'failed',
              reason: txError instanceof Error ? txError.message : 'Unknown error'
            });
          }
        }
      } catch (error) {
        console.error(`Error processing payment ${payment.id}:`, error);
        results.failedCount++;
        results.details.push({
          transactionId: payment.id || 'unknown',
          status: 'failed',
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const message = results.processedCount > 0
      ? `${results.processedCount} commission(s) de parrainage créée(s) avec succès.`
      : "Aucune nouvelle commission de parrainage à créer.";
    
    return new Response(
      JSON.stringify({
        success: true,
        message: message,
        results: results
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in fix-referral-commissions function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Une erreur inconnue est survenue"
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 500
      }
    );
  }
});
