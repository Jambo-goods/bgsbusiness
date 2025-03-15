
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    const userId = user.id;

    // Calculate deposits (from bank transfers)
    const { data: transfersData, error: transfersError } = await supabaseClient
      .from("bank_transfers")
      .select("amount, status")
      .eq("user_id", userId)
      .in("status", ["received", "reçu"]);

    if (transfersError) {
      throw transfersError;
    }

    console.log("Confirmed transfers:", transfersData);
    const totalTransfers = transfersData.reduce(
      (sum, transfer) => sum + (transfer.amount || 0), 
      0
    );
    console.log("Total transfers amount:", totalTransfers);

    // Add deposits from wallet transactions
    const { data: depositTransactions, error: depositError } = await supabaseClient
      .from("wallet_transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "deposit")
      .eq("status", "completed");

    if (depositError) {
      throw depositError;
    }

    console.log("Deposit transactions:", depositTransactions);
    const totalDeposits = depositTransactions.reduce(
      (sum, transaction) => sum + (transaction.amount || 0),
      totalTransfers
    );
    console.log("Total deposits (transfers + transactions):", totalDeposits);

    // Calculate completed withdrawals
    const { data: withdrawalRequests, error: withdrawalError } = await supabaseClient
      .from("withdrawal_requests")
      .select("amount")
      .eq("user_id", userId)
      .in("status", ["completed", "approved"])
      .not("processed_at", "is", null);

    if (withdrawalError) {
      throw withdrawalError;
    }

    console.log("Withdrawal requests:", withdrawalRequests);
    const totalWithdrawals = withdrawalRequests.reduce(
      (sum, withdrawal) => sum + (withdrawal.amount || 0),
      0
    );
    console.log("Total withdrawal requests:", totalWithdrawals);

    // Add withdrawals from wallet transactions
    const { data: withdrawalTransactions, error: withdrawalTxError } = await supabaseClient
      .from("wallet_transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "withdrawal")
      .eq("status", "completed");

    if (withdrawalTxError) {
      throw withdrawalTxError;
    }

    console.log("Withdrawal transactions:", withdrawalTransactions);
    const totalAllWithdrawals = withdrawalTransactions.reduce(
      (sum, transaction) => sum + (transaction.amount || 0),
      totalWithdrawals
    );
    console.log("Total all withdrawals:", totalAllWithdrawals);

    // Final balance calculation
    const finalBalance = totalDeposits - totalAllWithdrawals;
    console.log("Final calculated balance:", finalBalance);

    // Update the user's wallet balance
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ wallet_balance: finalBalance })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    // Return the result
    return new Response(
      JSON.stringify({
        success: true,
        balance: finalBalance,
        details: {
          deposits: totalDeposits,
          withdrawals: totalAllWithdrawals,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
