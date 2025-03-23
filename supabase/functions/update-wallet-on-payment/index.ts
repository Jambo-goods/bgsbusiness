
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_deno_apps

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0";

console.log("Hello from update-wallet-on-payment!");

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get request body
    const { paymentId, projectId, percentage } = await req.json();

    if (!paymentId || !projectId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: paymentId, projectId" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Processing wallet updates for payment ${paymentId} on project ${projectId} with percentage ${percentage}%`);

    // Create a Supabase client with the project service key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } }
    );

    // Get the payment details
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("scheduled_payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      console.error("Error fetching payment:", paymentError);
      return new Response(
        JSON.stringify({ error: "Error fetching payment", details: paymentError }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Get all investments for this project
    const { data: investments, error: investmentsError } = await supabaseAdmin
      .from("investments")
      .select("user_id, amount, id")
      .eq("project_id", projectId)
      .eq("status", "active");

    if (investmentsError) {
      console.error("Error fetching investments:", investmentsError);
      return new Response(
        JSON.stringify({ error: "Error fetching investments", details: investmentsError }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    console.log(`Found ${investments.length} investments for project ${projectId}`);
    const paymentPercentage = percentage || payment.percentage || 1;
    
    // Process each investor
    let successCount = 0;
    let errorCount = 0;

    for (const investment of investments) {
      try {
        const userId = investment.user_id;
        const investmentAmount = investment.amount;
        const investmentId = investment.id;
        
        // Calculate payment amount for this investor based on their investment amount
        const paymentAmount = Math.round((investmentAmount * paymentPercentage) / 100);
        
        console.log(`Processing user ${userId}: investment ${investmentAmount}€ × ${paymentPercentage}% = ${paymentAmount}€ payment`);
        
        // 1. Update wallet balance
        const { data: walletUpdate, error: walletError } = await supabaseAdmin.rpc(
          "increment_wallet_balance",
          { user_id: userId, increment_amount: paymentAmount }
        );

        if (walletError) {
          console.error(`Error updating wallet balance for user ${userId}:`, walletError);
          errorCount++;
          continue;
        }

        // 2. Create wallet transaction
        const { data: transaction, error: transactionError } = await supabaseAdmin
          .from("wallet_transactions")
          .insert({
            user_id: userId,
            investment_id: investmentId,
            project_id: projectId,
            amount: paymentAmount,
            type: "yield",
            status: "completed",
            description: `Rendement mensuel (${paymentPercentage}%)`
          })
          .select()
          .single();

        if (transactionError) {
          console.error(`Error creating transaction for user ${userId}:`, transactionError);
          errorCount++;
          continue;
        }

        console.log(`Successfully processed payment for user ${userId}. Transaction ID: ${transaction.id}`);
        successCount++;
      } catch (e) {
        console.error(`Error processing investment:`, e);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${successCount} payments successfully, ${errorCount} errors`,
        payment_id: paymentId
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
