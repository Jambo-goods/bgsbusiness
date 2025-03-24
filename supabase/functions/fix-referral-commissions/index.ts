
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
    
    console.log("🔍 Starting fix-referral-commissions function");
    
    // Vérifier l'existence de la table referral_commissions
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('referral_commissions')
        .select('id')
        .limit(1);
        
      console.log("📋 Table referral_commissions check:", tableCheck ? "exists" : "error", tableError?.message || "no error");
    } catch (tableCheckError) {
      console.error("❌ Error checking referral_commissions table:", tableCheckError);
    }
    
    // Get all paid yield payments that don't have corresponding commissions
    const { data: payments, error: paymentsError } = await supabase
      .from('scheduled_payments')
      .select(`
        id,
        project_id,
        total_scheduled_amount,
        percentage,
        status,
        projects:project_id (name)
      `)
      .eq('status', 'paid');
      
    if (paymentsError) {
      console.error("❌ Error fetching payments:", paymentsError);
      throw new Error(`Error fetching payments: ${paymentsError.message}`);
    }
    
    console.log(`📊 Found ${payments?.length || 0} paid payments to check`);
    
    // Process results
    const results = {
      processedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      details: [] as any[]
    };
    
    if (!payments || payments.length === 0) {
      console.log("⚠️ No paid payments found to process");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Aucun paiement au statut 'payé' trouvé.",
          results: results
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Process each payment
    for (const payment of payments || []) {
      try {
        const paymentId = payment.id;
        const amount = payment.total_scheduled_amount || 0;
        
        console.log(`🔄 Processing payment ${paymentId}, amount: ${amount}, status: ${payment.status}`);
        
        if (!paymentId || amount <= 0) {
          console.log(`⏩ Skipping payment with invalid data: ${paymentId}, amount: ${amount}`);
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
          console.error(`❌ Error fetching transactions for payment ${paymentId}:`, txError);
          results.failedCount++;
          results.details.push({
            transactionId: paymentId,
            status: 'failed',
            reason: `Error fetching transactions: ${txError.message}`
          });
          continue;
        }
        
        console.log(`📝 Found ${transactions?.length || 0} yield transactions for payment ${paymentId}`);
        
        // If no transactions, check if we need to create them first
        if (!transactions || transactions.length === 0) {
          // Get the users who have investments in this project
          const { data: investments, error: investError } = await supabase
            .from('investments')
            .select(`
              id,
              user_id,
              amount,
              yield_rate
            `)
            .eq('project_id', payment.project_id)
            .eq('status', 'active');
            
          if (investError) {
            console.error(`❌ Error fetching investments for project ${payment.project_id}:`, investError);
            results.failedCount++;
            results.details.push({
              transactionId: paymentId,
              status: 'failed',
              reason: `Error fetching investments: ${investError.message}`
            });
            continue;
          }
          
          console.log(`📈 Found ${investments?.length || 0} active investments for this project`);
          
          if (!investments || investments.length === 0) {
            console.log(`⏩ Skipping payment ${paymentId} - no active investments found`);
            results.skippedCount++;
            results.details.push({
              transactionId: paymentId,
              status: 'skipped',
              reason: 'No active investments found for this project'
            });
            continue;
          }
        }
        
        // Process using existing transactions
        if (transactions && transactions.length > 0) {
          for (const transaction of transactions) {
            try {
              await processTransactionCommission(
                supabase, 
                transaction, 
                paymentId, 
                results
              );
            } catch (txProcessError) {
              console.error(`❌ Error processing transaction for payment ${paymentId}:`, txProcessError);
              results.failedCount++;
              results.details.push({
                transactionId: paymentId,
                status: 'failed',
                reason: txProcessError instanceof Error ? txProcessError.message : 'Unknown error'
              });
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing payment ${payment.id}:`, error);
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
    
    console.log(`✅ Fix completed: ${message}`);
    console.log(`📊 Stats: ${results.processedCount} created, ${results.skippedCount} skipped, ${results.failedCount} failed`);
    
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
    console.error("❌ Error in fix-referral-commissions function:", error);
    
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

// Helper function to process a single transaction's commission
async function processTransactionCommission(
  supabase: any,
  transaction: any,
  paymentId: string,
  results: any
) {
  const userId = transaction.user_id;
  const txAmount = transaction.amount;
  
  console.log(`👤 Processing commission for user ${userId}, transaction amount: ${txAmount}`);
  
  // Check for existing commission for this transaction/payment
  const { data: existingCommission, error: checkError } = await supabase
    .from('referral_commissions')
    .select('id')
    .eq('payment_id', paymentId)
    .eq('referred_id', userId)
    .maybeSingle();
    
  if (checkError) {
    console.error(`❌ Error checking existing commission for user ${userId}:`, checkError);
    throw new Error(`Error checking commission: ${checkError.message}`);
  }
  
  if (existingCommission) {
    console.log(`⏩ Commission already exists for user ${userId} and payment ${paymentId}`);
    results.skippedCount++;
    results.details.push({
      transactionId: paymentId,
      status: 'skipped',
      reason: `Commission already exists for user ${userId}`
    });
    return;
  }
  
  // Find referrer for this user
  const { data: referralData, error: referralError } = await supabase
    .from('referrals')
    .select('id, referrer_id, status, total_commission')
    .eq('referred_id', userId)
    .eq('status', 'valid')
    .maybeSingle();
    
  if (referralError) {
    console.error(`❌ Error finding referral for user ${userId}:`, referralError);
    throw new Error(`Error finding referral: ${referralError.message}`);
  }
  
  if (!referralData || !referralData.referrer_id) {
    console.log(`ℹ️ No valid referral found for user ${userId}`);
    results.skippedCount++;
    results.details.push({
      transactionId: paymentId,
      status: 'skipped',
      reason: `No valid referral found for user ${userId}`
    });
    return;
  }
  
  console.log(`🔗 Found referral: referrer=${referralData.referrer_id}, referral_id=${referralData.id}`);
  
  // Calculate commission (10%)
  const commissionAmount = Math.round(txAmount * 0.1 * 100) / 100;
  
  if (commissionAmount <= 0) {
    console.log(`⏩ Commission amount ${commissionAmount} is too small for user ${userId}`);
    results.skippedCount++;
    results.details.push({
      transactionId: paymentId,
      status: 'skipped',
      reason: `Commission amount is too small: ${commissionAmount}`
    });
    return;
  }
  
  console.log(`💰 Creating commission of ${commissionAmount} for referrer ${referralData.referrer_id}`);
  
  try {
    // Create referral commission record FIRST
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
      console.error(`❌ Error creating referral commission record:`, commissionError);
      throw new Error(`Error creating commission record: ${commissionError.message}`);
    }
    
    console.log(`✅ Created referral commission record: ${commission.id}`);
    
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
      console.error(`❌ Error creating wallet transaction for referrer ${referralData.referrer_id}:`, walletError);
      // Continue anyway - the commission record is created
    } else {
      console.log(`✅ Created wallet transaction: ${walletTx.id}`);
    }
    
    // Update referrer's wallet balance
    const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
      user_id: referralData.referrer_id,
      increment_amount: commissionAmount
    });
    
    if (balanceError) {
      console.error(`❌ Error updating wallet balance for referrer ${referralData.referrer_id}:`, balanceError);
      // Continue anyway - the transaction record is created
    } else {
      console.log(`✅ Updated wallet balance for referrer ${referralData.referrer_id}`);
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
      console.error(`❌ Error updating referral record:`, updateError);
      // Continue anyway - the commission record is created
    } else {
      console.log(`✅ Updated total_commission in referral record: ${totalCommission}`);
    }
    
    // Send notification to referrer
    try {
      const { error: notifError } = await supabase.from('notifications').insert({
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
      
      if (notifError) {
        console.error("❌ Error creating notification:", notifError);
      } else {
        console.log(`✅ Created notification for referrer ${referralData.referrer_id}`);
      }
    } catch (notifError) {
      console.error("❌ Error creating notification:", notifError);
      // Continue anyway - notification is not critical
    }
    
    results.processedCount++;
    results.details.push({
      transactionId: paymentId,
      status: 'success',
      commission: commissionAmount,
      referrerId: referralData.referrer_id
    });
    
    console.log(`✅ Successfully processed commission for payment ${paymentId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error in commission creation:`, error);
    throw error;
  }
}
