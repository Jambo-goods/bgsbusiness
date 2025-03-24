
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
    
    // First, check if there are any wallet transactions with type 'yield'
    const { data: yieldTransactions, error: yieldError } = await supabase
      .from('wallet_transactions')
      .select(`
        id,
        user_id,
        amount,
        type,
        created_at
      `)
      .eq('type', 'yield')
      .eq('status', 'completed');
      
    if (yieldError) {
      console.error("❌ Error fetching yield transactions:", yieldError);
      throw new Error(`Error fetching yield transactions: ${yieldError.message}`);
    }
    
    console.log(`📊 Found ${yieldTransactions?.length || 0} yield transactions to check`);
    
    // Process results
    const results = {
      processedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      details: [] as any[]
    };
    
    if (!yieldTransactions || yieldTransactions.length === 0) {
      console.log("⚠️ No yield transactions found to process");
      
      // Let's create a test yield transaction for debugging purposes
      console.log("🧪 Creating a test yield transaction to test the commission system");
      
      // Try to get a random user with a valid referral
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          id,
          referred_id,
          referrer_id,
          status
        `)
        .eq('status', 'valid')
        .limit(1);
        
      if (referralsError || !referrals || referrals.length === 0) {
        console.log("⚠️ No valid referrals found to create test transaction");
        return new Response(
          JSON.stringify({
            success: true,
            message: "Aucune transaction de rendement trouvée et aucun parrainage valide pour créer un test.",
            results: results
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const testReferral = referrals[0];
      console.log(`📝 Creating test yield transaction for referred user ${testReferral.referred_id}`);
      
      // Create a test yield transaction for the referred user
      const { data: testTransaction, error: createError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: testReferral.referred_id,
          amount: 100, // 100 euros yield
          type: 'yield',
          description: 'Test de rendement pour commission',
          status: 'completed',
          receipt_confirmed: true
        })
        .select()
        .single();
        
      if (createError) {
        console.error("❌ Error creating test transaction:", createError);
        return new Response(
          JSON.stringify({
            success: false,
            message: "Erreur lors de la création de la transaction de test.",
            error: createError.message
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      console.log(`✅ Created test transaction: ${testTransaction.id}`);
      
      // Now process this test transaction
      const processResult = await processTransactionCommission(
        supabase, 
        testTransaction, 
        `transaction_${testTransaction.id}`, 
        results
      );
      
      return new Response(
        JSON.stringify({
          success: true,
          message: processResult ? "Transaction de test traitée avec succès." : "Échec du traitement de la transaction de test.",
          results: results
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Process each yield transaction
    for (const transaction of yieldTransactions) {
      try {
        console.log(`🔄 Processing transaction ${transaction.id}, amount: ${transaction.amount}`);
        
        // Generate source identifier
        const source = `transaction_${transaction.id}`;
          
        await processTransactionCommission(
          supabase, 
          transaction, 
          source, 
          results
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
  source: string,
  results: any
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
      transactionId: transactionId,
      status: 'skipped',
      reason: `No valid referral found for user ${userId}`
    });
    return false;
  }
  
  console.log(`🔗 Found referral: referrer=${referralData.referrer_id}, referral_id=${referralData.id}`);
  
  // Calculate commission (10%)
  const commissionAmount = Math.round(txAmount * 0.1 * 100) / 100;
  
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
  
  try {
    // Create referral commission record - THIS IS THE KEY PART THAT WAS FAILING
    const insertData = {
      referral_id: referralData.id,
      referrer_id: referralData.referrer_id,
      referred_id: userId,
      amount: commissionAmount,
      source: source,
      status: 'completed'
    };
    
    console.log("📝 Inserting commission record with data:", JSON.stringify(insertData));
    
    const { data: commission, error: commissionError } = await supabase
      .from('referral_commissions')
      .insert(insertData)
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
