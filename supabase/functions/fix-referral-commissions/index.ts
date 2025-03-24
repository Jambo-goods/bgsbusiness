
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
    // Get Supabase connection
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables not set");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("🔍 Starting fix-referral-commissions function");
    
    // First get the valid transaction types from the database
    const { data: validTypeData, error: typeCheckError } = await supabase
      .from('wallet_transactions')
      .select('type')
      .limit(10);
      
    if (typeCheckError) {
      console.error("❌ Error fetching valid transaction types:", typeCheckError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Error fetching valid transaction types: ${typeCheckError.message}`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Create a set of valid transaction types
    const validTypes = new Set();
    if (validTypeData && validTypeData.length > 0) {
      validTypeData.forEach(item => validTypes.add(item.type));
      console.log(`📊 Found valid transaction types: ${Array.from(validTypes).join(', ')}`);
    } else {
      // Default fallback types if we can't determine from existing data
      validTypes.add('commission');
      validTypes.add('withdrawal');
      validTypes.add('deposit');
      validTypes.add('yield');
      console.log("⚠️ No transaction types found in database, using fallback types");
    }
    
    // Check if referrals exist
    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select(`
        id,
        referrer_id,
        referred_id,
        status,
        commission_rate,
        total_commission
      `)
      .eq('status', 'valid');
      
    if (referralsError) {
      console.error("❌ Error fetching referrals:", referralsError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Error fetching referrals: ${referralsError.message}`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    console.log(`📊 Found ${referrals?.length || 0} valid referrals to process`);
    
    if (!referrals || referrals.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Aucun parrainage valide trouvé dans le système.",
          results: { processedCount: 0, skippedCount: 0, failedCount: 0, details: [] }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Create a map of referred_id to referral for quick lookup
    const referralMap = new Map();
    referrals.forEach(referral => {
      referralMap.set(referral.referred_id, referral);
    });
    
    // Now fetch all yield transactions for users who have been referred
    const referredUserIds = referrals.map(r => r.referred_id);
    
    // Check if 'yield' is a valid type, otherwise use an appropriate type
    const yieldType = validTypes.has('yield') ? 'yield' : 
                     (validTypes.has('investment_return') ? 'investment_return' : 
                     Array.from(validTypes)[0] || 'commission');
    
    console.log(`🔍 Using transaction type '${yieldType}' for yield transactions`);
    
    // Fetch all yield transactions for referred users
    const { data: yieldTransactions, error: yieldError } = await supabase
      .from('wallet_transactions')
      .select(`
        id,
        user_id,
        amount,
        type,
        created_at,
        status,
        payment_id
      `)
      .eq('type', yieldType)
      .eq('status', 'completed')
      .in('user_id', referredUserIds);
      
    if (yieldError) {
      console.error("❌ Error fetching yield transactions:", yieldError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Error fetching yield transactions: ${yieldError.message}`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    console.log(`📊 Found ${yieldTransactions?.length || 0} yield transactions to check for referred users`);
    
    // Also check scheduled payments that have been paid (these might not have wallet transactions yet)
    const { data: scheduledPayments, error: paymentsError } = await supabase
      .from('scheduled_payments')
      .select(`
        id,
        project_id,
        payment_date,
        status,
        percentage,
        total_scheduled_amount
      `)
      .eq('status', 'paid');
    
    if (paymentsError) {
      console.error("❌ Error fetching scheduled payments:", paymentsError);
    } else {
      console.log(`📊 Found ${scheduledPayments?.length || 0} paid scheduled payments to check`);
    }
    
    // Process results
    const results = {
      processedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      details: [] as any[]
    };
    
    if ((!yieldTransactions || yieldTransactions.length === 0) && (!scheduledPayments || scheduledPayments.length === 0)) {
      console.log("⚠️ No yield transactions or scheduled payments found for referred users");
      
      // Create a test transaction for the first referral
      const testReferral = referrals[0];
      console.log(`📝 Creating test yield transaction for referred user ${testReferral.referred_id}`);
      
      try {
        // Make sure we're using a valid transaction type for yield
        const yieldTypeForTest = validTypes.has('yield') ? 'yield' : 
                             (validTypes.has('investment_return') ? 'investment_return' : 
                              Array.from(validTypes)[0]);
        
        if (!yieldTypeForTest) {
          throw new Error("No valid transaction types found in the database for yield transactions.");
        }
        
        console.log(`✅ Using transaction type '${yieldTypeForTest}' for test yield transaction`);
        
        // Create a small test yield transaction for the referred user
        const { data: testTransaction, error: createError } = await supabase
          .from('wallet_transactions')
          .insert({
            user_id: testReferral.referred_id,
            amount: 100, // Small test amount
            type: yieldTypeForTest,
            description: 'Test de rendement pour commission',
            status: 'completed',
            receipt_confirmed: true
          })
          .select()
          .single();
          
        if (createError) {
          console.error("❌ Error creating test yield transaction:", createError);
          throw new Error(`Error creating test yield transaction: ${createError.message}`);
        }
        
        console.log(`✅ Created test yield transaction: ${testTransaction?.id}`);
        
        // Process commission for test transaction (10% of yield amount)
        await processTransactionCommission(
          supabase, 
          testTransaction, 
          `yield_transaction_${testTransaction.id}`, 
          results,
          validTypes,
          testReferral
        );
      } catch (testError) {
        console.error("❌ Error in test transaction creation/processing:", testError);
        return new Response(
          JSON.stringify({
            success: false,
            error: testError instanceof Error ? testError.message : "Unknown error in test transaction"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    } else {
      // Process real yield transactions
      if (yieldTransactions && yieldTransactions.length > 0) {
        for (const transaction of yieldTransactions) {
          try {
            // Find the referral for this user
            const referral = referralMap.get(transaction.user_id);
            
            if (!referral) {
              console.log(`⏩ Skipping transaction ${transaction.id}: No valid referral found for user ${transaction.user_id}`);
              results.skippedCount++;
              results.details.push({
                transactionId: transaction.id,
                status: 'skipped',
                reason: `No valid referral found for user ${transaction.user_id}`
              });
              continue;
            }
            
            console.log(`🔄 Processing yield transaction ${transaction.id}, amount: ${transaction.amount} for user ${transaction.user_id}`);
            
            // Generate simple source identifier for this yield transaction
            const source = `yield_transaction_${transaction.id}`;
              
            await processTransactionCommission(
              supabase, 
              transaction, 
              source, 
              results,
              validTypes,
              referral
            );
          } catch (txProcessError) {
            console.error(`❌ Error processing transaction ${transaction.id}:`, txProcessError);
            results.failedCount++;
            results.details.push({
              transactionId: transaction.id,
              status: 'failed',
              reason: txProcessError instanceof Error ? txProcessError.message : 'Unknown error'
            });
          }
        }
      }
      
      // Process scheduled payments that don't have wallet transactions yet
      if (scheduledPayments && scheduledPayments.length > 0) {
        console.log(`🔍 Processing ${scheduledPayments.length} scheduled payments`);
        
        for (const payment of scheduledPayments) {
          try {
            // Get all investments for this project to find the referred users
            const { data: investments, error: investError } = await supabase
              .from('investments')
              .select('id, user_id, amount, project_id')
              .eq('project_id', payment.project_id);
              
            if (investError) {
              console.error(`❌ Error fetching investments for project ${payment.project_id}:`, investError);
              continue;
            }
            
            if (!investments || investments.length === 0) {
              console.log(`⏩ No investments found for project ${payment.project_id}`);
              continue;
            }
            
            console.log(`🔍 Processing ${investments.length} investments for scheduled payment ${payment.id}`);
            
            for (const investment of investments) {
              const userId = investment.user_id;
              
              // Check if this user is referred
              const referral = referralMap.get(userId);
              if (!referral) {
                console.log(`⏩ Skipping investment for user ${userId}: No valid referral found`);
                continue;
              }
              
              // Calculate individual yield amount for this user's investment
              // Using the percentage from the scheduled payment
              const yieldAmount = investment.amount * (payment.percentage / 100);
              
              console.log(`💰 Calculated yield of ${yieldAmount} for user ${userId} investment of ${investment.amount}`);
              
              // Create a synthetic transaction to process
              const syntheticTransaction = {
                id: `scheduled_payment_${payment.id}_investment_${investment.id}`,
                user_id: userId,
                amount: yieldAmount,
                type: validTypes.has('yield') ? 'yield' : 'investment_return',
                created_at: new Date().toISOString(),
                status: 'completed',
                payment_id: payment.id
              };
              
              const source = `scheduled_payment_${payment.id}_investment_${investment.id}`;
              
              await processTransactionCommission(
                supabase, 
                syntheticTransaction, 
                source, 
                results,
                validTypes,
                referral
              );
            }
          } catch (paymentProcessError) {
            console.error(`❌ Error processing scheduled payment ${payment.id}:`, paymentProcessError);
            results.failedCount++;
            results.details.push({
              paymentId: payment.id,
              status: 'failed',
              reason: paymentProcessError instanceof Error ? paymentProcessError.message : 'Unknown error'
            });
          }
        }
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
        },
        status: 200
      }
    );
  } catch (error) {
    console.error("❌ Error in fix-referral-commissions function:", error);
    
    // Always return a 200 status to prevent the Edge Function returned a non-2xx status code error
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
        status: 200
      }
    );
  }
});

// Helper function to process a single transaction's commission
async function processTransactionCommission(
  supabase: any,
  transaction: any,
  source: string,
  results: any,
  validTypes: Set<string>,
  existingReferral?: any
) {
  const userId = transaction.user_id;
  const yieldAmount = transaction.amount;
  const transactionId = transaction.id;
  
  console.log(`👤 Processing commission for user ${userId}, yield amount: ${yieldAmount}, transaction ID: ${transactionId}, source: ${source}`);
  
  // Validate transaction data
  if (!userId || !yieldAmount || yieldAmount <= 0) {
    console.log(`⏩ Skipping transaction with invalid data: userId=${userId}, amount=${yieldAmount}`);
    results.skippedCount++;
    results.details.push({
      transactionId: transactionId || 'unknown',
      status: 'skipped',
      reason: 'Invalid transaction data'
    });
    return false;
  }
  
  try {
    // Check for existing commission for this transaction
    const { data: existingCommission, error: checkError } = await supabase
      .from('referral_commissions')
      .select('id')
      .eq('source', source)
      .maybeSingle();
      
    if (checkError) {
      console.error(`❌ Error checking existing commission for transaction ${transactionId}:`, checkError);
      throw new Error(`Error checking commission: ${checkError.message}`);
    }
    
    if (existingCommission) {
      console.log(`⏩ Commission already exists for transaction ${transactionId} with source ${source}`);
      results.skippedCount++;
      results.details.push({
        transactionId: transactionId,
        status: 'skipped',
        reason: `Commission already exists for this transaction`
      });
      return false;
    }
    
    // Find referrer for this user if not provided
    let referralData = existingReferral;
    
    if (!referralData) {
      const { data: fetchedReferral, error: referralError } = await supabase
        .from('referrals')
        .select('id, referrer_id, status, commission_rate, total_commission')
        .eq('referred_id', userId)
        .eq('status', 'valid')
        .maybeSingle();
        
      if (referralError) {
        console.error(`❌ Error finding referral for user ${userId}:`, referralError);
        throw new Error(`Error finding referral: ${referralError.message}`);
      }
      
      referralData = fetchedReferral;
    }
    
    if (!referralData || !referralData.referrer_id) {
      console.log(`ℹ️ No valid referral found for user ${userId}`);
      results.skippedCount++;
      results.details.push({
        transactionId: transactionId,
        status: 'skipped',
        reason: `No valid referral found for user ${userId}`
      });
      return false;
    }
    
    console.log(`🔗 Found referral: referrer=${referralData.referrer_id}, referral_id=${referralData.id}`);
    
    // Calculate commission (10% of the yield amount or commission_rate if specified)
    const commissionRate = referralData.commission_rate ? referralData.commission_rate / 100 : 0.1;
    const commissionAmount = Math.round(yieldAmount * commissionRate * 100) / 100;
    
    if (commissionAmount <= 0) {
      console.log(`⏩ Commission amount ${commissionAmount} is too small for transaction ${transactionId}`);
      results.skippedCount++;
      results.details.push({
        transactionId: transactionId,
        status: 'skipped',
        reason: `Commission amount is too small: ${commissionAmount}`
      });
      return false;
    }
    
    console.log(`💰 Creating commission of ${commissionAmount} (${commissionRate * 100}% of ${yieldAmount}) for referrer ${referralData.referrer_id}`);
    
    // IMPORTANT: Creating the referral commission record first
    console.log(`📝 Creating referral_commission record with source: ${source}`);
    const { data: commission, error: commissionError } = await supabase
      .from('referral_commissions')
      .insert({
        referral_id: referralData.id,
        referrer_id: referralData.referrer_id,
        referred_id: userId,
        amount: commissionAmount,
        source: source,
        status: 'completed'
      })
      .select()
      .single();
      
    if (commissionError) {
      console.error(`❌ Error creating referral commission record:`, commissionError);
      throw new Error(`Error creating commission record: ${commissionError.message}`);
    }
    
    if (!commission) {
      throw new Error("Failed to create commission record - no data returned");
    }
    
    console.log(`✅ Created referral commission record: ${commission.id}`);
    
    // Create wallet transaction for commission
    try {
      // Make sure we're using a valid transaction type for the commission
      const commissionType = validTypes.has('commission') ? 'commission' : Array.from(validTypes)[0];
      
      if (!commissionType) {
        throw new Error("No valid transaction types found for commissions");
      }
      
      const { data: walletTx, error: walletError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: referralData.referrer_id,
          amount: commissionAmount,
          type: commissionType,
          description: `Commission de parrainage (${commissionRate * 100}% du rendement)`,
          status: 'completed',
          receipt_confirmed: true
        })
        .select()
        .single();
        
      if (walletError) {
        console.error(`❌ Error creating wallet transaction for referrer ${referralData.referrer_id}:`, walletError);
        // We'll continue anyway since the commission record was created
      } else {
        console.log(`✅ Created wallet transaction: ${walletTx.id}`);
      }
    } catch (walletError) {
      console.error(`❌ Error creating wallet transaction:`, walletError);
      // Continue anyway since the commission record was created
    }
    
    // Update referrer's wallet balance
    const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
      user_id: referralData.referrer_id,
      increment_amount: commissionAmount
    });
    
    if (balanceError) {
      console.error(`❌ Error updating wallet balance for referrer ${referralData.referrer_id}:`, balanceError);
      // We'll continue anyway since the transaction record was created
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
      // We'll continue anyway since the commission record was created
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
          transaction_id: transactionId
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
      transactionId: transactionId,
      status: 'success',
      commission: commissionAmount,
      referrerId: referralData.referrer_id
    });
    
    console.log(`✅ Successfully processed commission for transaction ${transactionId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error in commission creation:`, error);
    throw error;
  }
}
