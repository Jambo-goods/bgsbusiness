
// Follow Deno's ES module convention
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request payload
    const { paymentId, projectId, percentage, processAll, forceRefresh } = await req.json();
    
    if (!paymentId && !processAll) {
      return new Response(
        JSON.stringify({ error: "Missing required payment ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Processing payment: ${paymentId}, project: ${projectId}, percentage: ${percentage}, forceRefresh: ${forceRefresh}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all payments that need processing
    let query = supabase
      .from('scheduled_payments')
      .select('*')
      .eq('status', 'paid');
    
    if (!processAll && paymentId) {
      query = query.eq('id', paymentId);
    }
    
    if (!processAll && projectId) {
      query = query.eq('project_id', projectId);
    }
    
    // Only get payments that haven't been processed yet or force refresh
    if (!forceRefresh) {
      query = query.is('processed_at', null);
    }
    
    const { data: payments, error: paymentsError } = await query;
    
    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      throw paymentsError;
    }
    
    console.log(`Found ${payments?.length || 0} payments to process`);
    
    if (!payments || payments.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No payments to process" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    let processedCount = 0;
    let paymentIds = [];
    
    // Process each payment
    for (const payment of payments) {
      try {
        console.log(`Processing payment ID: ${payment.id}`);
        paymentIds.push(payment.id);
        
        // Get the project details
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', payment.project_id)
          .single();
        
        if (projectError) {
          console.error(`Error fetching project ${payment.project_id}:`, projectError);
          continue;
        }
        
        // Get all investments for this project
        const { data: investments, error: investmentsError } = await supabase
          .from('investments')
          .select('*')
          .eq('project_id', payment.project_id)
          .eq('status', 'active');
        
        if (investmentsError) {
          console.error(`Error fetching investments for project ${payment.project_id}:`, investmentsError);
          continue;
        }
        
        if (!investments || investments.length === 0) {
          console.log(`No investments found for project ${payment.project_id}`);
          continue;
        }
        
        console.log(`Found ${investments.length} investments for project ${payment.project_id}`);
        
        let localProcessedCount = 0;
        // Process each investor's yield
        for (const investment of investments) {
          const userId = investment.user_id;
          if (!userId) continue;
          
          // Calculate yield amount for this investor
          // Formula: investment amount * yield rate / 12 months * payment percentage / 100
          const monthlyYieldRate = (project.yield || 0) / 100 / 12;
          const yieldAmount = Math.round(investment.amount * monthlyYieldRate * (payment.percentage || 100) / 100);
          
          if (yieldAmount <= 0) continue;
          
          console.log(`Calculating yield for user ${userId}: ${investment.amount} * ${monthlyYieldRate} * ${payment.percentage || 100}% = ${yieldAmount}`);
          
          // Check if we've already processed this yield transaction
          const { data: existingTransaction } = await supabase
            .from('wallet_transactions')
            .select('id')
            .eq('user_id', userId)
            .eq('payment_id', payment.id)
            .eq('project_id', payment.project_id)
            .eq('type', 'yield')
            .maybeSingle();
            
          if (existingTransaction) {
            console.log(`Yield transaction already exists for user ${userId}, payment ${payment.id}`);
            
            if (!forceRefresh) {
              continue;
            } else {
              console.log(`Force refresh enabled, processing again anyway`);
            }
          }
          
          // Update user's wallet balance
          const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
            user_id: userId,
            increment_amount: yieldAmount
          });
          
          if (balanceError) {
            console.error(`Error updating wallet balance for user ${userId}:`, balanceError);
            continue;
          }
          
          // Create a wallet transaction record
          const { error: transactionError } = await supabase
            .from('wallet_transactions')
            .insert({
              user_id: userId,
              amount: yieldAmount,
              type: 'yield',
              description: `Rendement ${project.name} (${payment.percentage}%)`,
              status: 'completed',
              receipt_confirmed: true,
              payment_id: payment.id,
              project_id: payment.project_id
            });
            
          if (transactionError) {
            console.error(`Error creating transaction record for user ${userId}:`, transactionError);
            continue;
          }
          
          processedCount++;
          localProcessedCount++;
          
          // Create notification for the user
          const { error: notifError } = await supabase.from('notifications').insert({
            user_id: userId,
            title: "Rendement reçu",
            message: `Vous avez reçu un rendement de ${yieldAmount}€ pour le projet ${project.name}`,
            type: "yield",
            seen: false,
            data: {
              payment_id: payment.id,
              project_id: payment.project_id,
              amount: yieldAmount,
              category: "success"
            }
          });
          
          if (notifError) {
            console.error(`Error creating notification for user ${userId}:`, notifError);
          }
        }
        
        // Mark the payment as processed
        const { error: updateError } = await supabase
          .from('scheduled_payments')
          .update({ 
            processed_at: new Date().toISOString(),
            processed_investors_count: localProcessedCount,
            processed_amount: localProcessedCount > 0 ? 
              investments.reduce((sum, inv) => {
                const monthlyYieldRate = (project.yield || 0) / 100 / 12;
                const yield_amount = Math.round(inv.amount * monthlyYieldRate * (payment.percentage || 100) / 100);
                return sum + (yield_amount > 0 ? yield_amount : 0);
              }, 0) : 0
          })
          .eq('id', payment.id);
          
        if (updateError) {
          console.error(`Error marking payment ${payment.id} as processed:`, updateError);
        } else {
          console.log(`Payment ${payment.id} marked as processed with ${localProcessedCount} investors`);
        }
      } catch (err) {
        console.error(`Error processing payment ${payment.id}:`, err);
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        payments: payments.length,
        payment_ids: paymentIds,
        message: `Processed ${processedCount} yield transactions for ${payments.length} payments`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
