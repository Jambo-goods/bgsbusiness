
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Configure CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Create Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Required environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set");
}

// Handle HTTP request
serve(async (req: Request) => {
  console.log(`Bank Transfer Edge Function - Method: ${req.method}, URL: ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Set up Supabase client with admin privileges
    const supabase = createClient(
      supabaseUrl!,
      supabaseServiceKey!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse request body
    const { transferId, status, isProcessed, notes, userId } = await req.json();
    
    // Validate required parameters
    if (!transferId || !status) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: transferId and status are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing bank transfer update: ID=${transferId}, Status=${status}, Processed=${isProcessed}`);

    // Try using the updated RPC function with correct parameter naming
    const { data: rpcResult, error: rpcError } = await supabase.rpc("admin_mark_bank_transfer", {
      transfer_id: transferId,
      new_status: status,
      is_processed: isProcessed || false,
      notes: notes || `Mis à jour via edge function le ${new Date().toLocaleDateString('fr-FR')}`
    });

    // If RPC fails, fallback to direct update
    if (rpcError) {
      console.error("RPC update failed:", rpcError.message);
      
      // Direct update fallback
      const { data, error } = await supabase
        .from('bank_transfers')
        .update({
          status: status,
          processed: isProcessed || false,
          processed_at: isProcessed ? new Date().toISOString() : null,
          notes: notes || `Mis à jour via edge function le ${new Date().toLocaleDateString('fr-FR')}`
        })
        .eq('id', transferId)
        .select('*');
      
      if (error) {
        console.error("Direct update failed:", error.message);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Update successful via direct update");
      
      // Update user wallet balance if needed
      if (userId && (status === 'received' || status === 'reçu')) {
        await updateUserWalletBalance(supabase, userId, transferId);
      }
      
      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Update successful via RPC");
    
    // Check if we need to update the user's wallet balance
    if (userId && (status === 'received' || status === 'reçu')) {
      await updateUserWalletBalance(supabase, userId, transferId);
    }
    
    // Send success response
    return new Response(
      JSON.stringify({ success: true, data: rpcResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Edge function error:", error.message);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to update the user's wallet balance
async function updateUserWalletBalance(supabase, userId: string, transferId: string) {
  try {
    console.log(`Recalculating wallet balance for user ${userId}`);
    
    // Get the transfer to check the amount
    const { data: transfer, error: transferError } = await supabase
      .from('bank_transfers')
      .select('amount')
      .eq('id', transferId)
      .single();
    
    if (transferError) {
      console.error("Error fetching transfer:", transferError.message);
      return;
    }
    
    // First try to use the recalculate function
    const { error: recalcError } = await supabase.rpc('recalculate_wallet_balance', {
      user_uuid: userId
    });
    
    if (recalcError) {
      console.error("Recalculate wallet balance failed:", recalcError.message);
      
      // If recalculate fails and we have an amount, try increment instead
      if (transfer?.amount) {
        const { error: incrementError } = await supabase.rpc('increment_wallet_balance', {
          user_id: userId,
          increment_amount: transfer.amount
        });
        
        if (incrementError) {
          console.error("Increment wallet balance failed:", incrementError.message);
        } else {
          console.log(`Successfully incremented wallet balance by ${transfer.amount}`);
        }
      }
    } else {
      console.log("Successfully recalculated wallet balance");
    }
  } catch (error) {
    console.error("Error updating wallet balance:", error.message);
  }
}
