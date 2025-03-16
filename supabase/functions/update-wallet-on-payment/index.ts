
// Supabase Edge Function: update-wallet-on-payment
// This function listens for changes to scheduled_payments table
// When a payment status changes to "paid", it updates the user's wallet balance
// and creates a notification

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// CORS headers for browser compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { record, old_record } = await req.json();

    // Only proceed if the status changed to "paid"
    if (!record || !old_record || record.status !== "paid" || old_record.status === "paid") {
      return new Response(
        JSON.stringify({ message: "No action required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Payment status changed to paid:", record);

    // Create a Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get project details
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("id", record.project_id)
      .single();

    if (projectError) {
      throw new Error(`Error fetching project: ${projectError.message}`);
    }

    // Get the investors for this project
    const { data: investments, error: investmentsError } = await supabaseAdmin
      .from("investments")
      .select("user_id, amount")
      .eq("project_id", record.project_id)
      .eq("status", "active");

    if (investmentsError) {
      throw new Error(`Error fetching investments: ${investmentsError.message}`);
    }

    console.log(`Found ${investments.length} investors for project ${project.name}`);

    // Calculate and distribute the payment to all investors
    const results = await Promise.all(
      investments.map(async (investment) => {
        try {
          // Calculate the investor's share based on their investment amount
          const totalInvestment = record.total_invested_amount || 0;
          const investorShare = totalInvestment > 0
            ? (investment.amount / totalInvestment) * record.total_scheduled_amount
            : 0;
          
          const roundedAmount = Math.round(investorShare); // Round to nearest integer

          console.log(`Investor ${investment.user_id} gets ${roundedAmount}€ from their ${investment.amount}€ investment`);

          // Update the investor's wallet balance
          const { error: walletError } = await supabaseAdmin.rpc(
            "increment_wallet_balance",
            {
              user_id: investment.user_id,
              increment_amount: roundedAmount
            }
          );

          if (walletError) {
            throw new Error(`Error updating wallet: ${walletError.message}`);
          }

          // Create a notification for the investor
          const { error: notificationError } = await supabaseAdmin
            .from("notifications")
            .insert({
              user_id: investment.user_id,
              title: "Rendement reçu",
              message: `Vous avez reçu ${roundedAmount}€ de rendement pour votre investissement dans ${project.name}.`,
              type: "yield",
              data: {
                amount: roundedAmount,
                category: "success",
                project_id: record.project_id,
                project_name: project.name,
                payment_id: record.id
              }
            });

          if (notificationError) {
            throw new Error(`Error creating notification: ${notificationError.message}`);
          }

          // Create a wallet transaction record
          const { error: transactionError } = await supabaseAdmin
            .from("wallet_transactions")
            .insert({
              user_id: investment.user_id,
              amount: roundedAmount,
              type: "yield",
              status: "completed",
              description: `Rendement de ${project.name}`
            });

          if (transactionError) {
            throw new Error(`Error creating transaction: ${transactionError.message}`);
          }

          return {
            user_id: investment.user_id,
            amount: roundedAmount,
            success: true
          };
        } catch (err) {
          console.error(`Error processing payment for user ${investment.user_id}:`, err);
          return {
            user_id: investment.user_id,
            success: false,
            error: err.message
          };
        }
      })
    );

    // Return the results
    return new Response(
      JSON.stringify({ 
        message: "Payments processed successfully", 
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error processing scheduled payment:", err);
    return new Response(
      JSON.stringify({ 
        error: err.message || "Unknown error occurred" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
