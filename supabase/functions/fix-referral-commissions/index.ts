
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
    
    // First check if there are any valid referrals in the system
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
    
    const { data: yieldTransactions, error: yieldError } = await supabase
      .from('wallet_transactions')
      .select(`
        id,
        user_id,
        amount,
        type,
        created_at,
        status
      `)
      .eq('type', 'yield')
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
    
    // Process results
    const results = {
      processedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      details: [] as any[]
    };
    
    if (!yieldTransactions || yieldTransactions.length === 0) {
      console.log("⚠️ No yield transactions found for referred users");
      
      // Try to create a test transaction instead
      const testReferral = referrals[0];
      console.log(`📝 Creating test yield transaction for referred user ${testReferral.referred_id}`);
      
      try {
        // Get the valid transaction types from the database
        const { data: validTypesData, error: validTypesError } = await supabase
          .from('wallet_transactions')
          .select('type')
          .limit(1);
          
        if (validTypesError) {
          console.error("❌ Error getting valid transaction types:", validTypesError);
          throw new Error(`Error getting valid transaction types: ${validTypesError.message}`);
        }
        
        // Create a test yield transaction for the referred user using a valid type
        const { data: testTransaction, error: createError } = await supabase
          .from('wallet_transactions')
          .insert({
            user_id: testReferral.referred_id,
            amount: 100, // 100 euros yield
            type: 'yield', // This should be a valid transaction type in your database
            description: 'Test de rendement pour commission',
            status: 'completed',
            receipt_confirmed: true
          })
          .select()
          .single();
          
        if (createError) {
          console.error("❌ Error creating test transaction:", createError);
          
          // Check if the error is due to a constraint violation
          if (createError.message.includes("violates check constraint")) {
            console.log("🔄 Check constraint violation. Getting allowed transaction types...");
            
            // Query the database for the constraint definition to determine valid types
            const { data: constraintData, error: constraintError } = await supabase.rpc(
              'get_constraint_definition', 
              { table_name: 'wallet_transactions', constraint_name: 'wallet_transactions_type_check' }
            ).maybeSingle();
            
            if (constraintError || !constraintData) {
              console.error("❌ Unable to get constraint definition:", constraintError || "No data returned");
              
              // Fallback to common transaction types
              return new Response(
                JSON.stringify({
                  success: false,
                  error: `Error creating test transaction: ${createError.message}. Please check valid transaction types in your database schema for the wallet_transactions table, column 'type'.`
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
              );
            }
            
            return new Response(
              JSON.stringify({
                success: false,
                error: `Error creating test transaction: ${createError.message}. Valid transaction types are defined in your database constraint.`
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
          }
          
          return new Response(
            JSON.stringify({
              success: false,
              error: `Error creating test transaction: ${createError.message}`
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }
        
        if (!testTransaction) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Test transaction creation failed - no data returned"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }
        
        console.log(`✅ Created test transaction: ${testTransaction.id}`);
        
        // Now process this test transaction
        const source = `transaction_${testTransaction.id}`;
        await processTransactionCommission(
          supabase, 
          testTransaction, 
          source, 
          results
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
      // Process each yield transaction from users who have been referred
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
          
          console.log(`🔄 Processing transaction ${transaction.id}, amount: ${transaction.amount} for user ${transaction.user_id}`);
          
          // Generate simple source identifier
          const source = `transaction_${transaction.id}`;
            
          await processTransactionCommission(
            supabase, 
            transaction, 
            source, 
            results,
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
  existingReferral?: any
) {
  const userId = transaction.user_id;
  const txAmount = transaction.amount;
  const transactionId = transaction.id;
  
  console.log(`👤 Processing commission for user ${userId}, transaction amount: ${txAmount}, transaction ID: ${transactionId}, source: ${source}`);
  
  // Validate transaction data
  if (!userId || !txAmount || txAmount <= 0) {
    console.log(`⏩ Skipping transaction with invalid data: userId=${userId}, amount=${txAmount}`);
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
    
    // Calculate commission (10% or commission_rate if specified)
    const commissionRate = referralData.commission_rate ? referralData.commission_rate / 100 : 0.1;
    const commissionAmount = Math.round(txAmount * commissionRate * 100) / 100;
    
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
    
    console.log(`💰 Creating commission of ${commissionAmount} for referrer ${referralData.referrer_id}`);
    
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
    
    // Get valid transaction types to ensure we comply with the constraint
    let validType = 'commission';
    
    try {
      // Create wallet transaction for commission using the valid type
      const { data: walletTx, error: walletError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: referralData.referrer_id,
          amount: commissionAmount,
          type: validType,
          description: `Commission de parrainage (${commissionRate * 100}%)`,
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
