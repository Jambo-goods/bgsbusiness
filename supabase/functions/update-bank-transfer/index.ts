
// Edge function for updating bank transfers

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

// CORS headers for browser support
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Type definitions
interface TransferUpdateRequest {
  transferId: string;
  status: string;
  processedDate?: string | null;
  notes?: string;
}

serve(async (req) => {
  console.log("Bank Transfer Edge Function - Method:", req.method, "URL:", req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { ...corsHeaders },
      status: 204
    });
  }
  
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: "Method not allowed", message: "Only POST requests are supported" }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    );
  }
  
  try {
    // Get request body
    const requestData: TransferUpdateRequest = await req.json();
    console.log("Received update request:", requestData);
    
    // Validate required fields
    if (!requestData.transferId || !requestData.status) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields", 
          message: "transferId and status are required" 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error", 
          message: "Missing database connection details"
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if the transfer exists
    const { data: transferExists, error: checkError } = await supabase
      .from("bank_transfers")
      .select("id, status")
      .eq("id", requestData.transferId)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking transfer existence:", checkError);
      return new Response(
        JSON.stringify({ 
          error: "Database error", 
          message: `Error checking transfer: ${checkError.message}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    if (!transferExists) {
      console.error("Transfer not found:", requestData.transferId);
      return new Response(
        JSON.stringify({ 
          error: "Not found", 
          message: "The requested transfer was not found"
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      );
    }
    
    // Process the update
    const isProcessed = requestData.status === 'received' || 
                       (requestData.processedDate ? true : false);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('bank_transfers')
      .update({
        status: requestData.status,
        processed: isProcessed,
        processed_at: isProcessed 
          ? (requestData.processedDate || new Date().toISOString()) 
          : null,
        notes: requestData.notes || `Mis à jour via API le ${new Date().toISOString()}`
      })
      .eq('id', requestData.transferId)
      .select();
    
    if (updateError) {
      console.error("Error updating transfer:", updateError);
      return new Response(
        JSON.stringify({ 
          error: "Update failed", 
          message: `Database update error: ${updateError.message}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
    // Update successful - handle wallet recalculation if status is 'received'
    if (requestData.status === 'received') {
      try {
        // Get the user ID associated with this transfer
        const { data: transferData } = await supabase
          .from("bank_transfers")
          .select("user_id")
          .eq("id", requestData.transferId)
          .single();
          
        if (transferData?.user_id) {
          console.log("Recalculating balance for user:", transferData.user_id);
          const { error: rpcError } = await supabase.rpc('recalculate_wallet_balance', {
            user_uuid: transferData.user_id
          });
          
          if (rpcError) {
            console.error("Error recalculating wallet balance:", rpcError);
            // Continue despite error since the transfer update was successful
          } else {
            console.log("Wallet balance recalculated successfully");
          }
        }
      } catch (walletError) {
        console.error("Error during wallet update:", walletError);
        // Continue despite error
      }
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Transfer updated successfully to '${requestData.status}'`,
        data: updateResult
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error("Unexpected error processing request:", error);
    return new Response(
      JSON.stringify({ 
        error: "Server error", 
        message: error.message || "An unexpected error occurred" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
