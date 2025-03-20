
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, createResponse } from "./corsUtils.ts";
import { updateUserWalletBalance } from "./walletHelpers.ts";
import { sendUserNotification } from "./notificationHelpers.ts";

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
    const { 
      transferId, 
      status, 
      isProcessed, 
      notes, 
      userId, 
      sendNotification,
      creditWallet = true // Default to true for backward compatibility
    } = await req.json();
    
    // Validate required parameters
    if (!transferId || !status) {
      return createResponse({ 
        success: false, 
        error: "Missing required parameters: transferId and status are required" 
      }, 400);
    }

    console.log(`Processing bank transfer update: ID=${transferId}, Status=${status}, Processed=${isProcessed}, CreditWallet=${creditWallet}`);

    // First try to find the transfer in bank_transfers
    const { data: existingTransfer, error: checkError } = await supabase
      .from('bank_transfers')
      .select('id, user_id, amount, reference')
      .eq('id', transferId)
      .maybeSingle();
      
    // If not found in bank_transfers, check if it exists in wallet_transactions
    if (!existingTransfer && !checkError) {
      const { data: walletTransfer, error: walletError } = await supabase
        .from('wallet_transactions')
        .select('id, user_id, amount, description')
        .eq('id', transferId)
        .maybeSingle();
        
      if (walletTransfer) {
        console.log("Transfer found in wallet_transactions:", walletTransfer);
        
        // Update the wallet transaction
        const { data, error } = await supabase
          .from('wallet_transactions')
          .update({
            status: status === 'received' ? 'completed' : status,
            receipt_confirmed: status === 'received',
          })
          .eq('id', transferId)
          .select();
          
        if (error) {
          console.error("Error updating wallet transaction:", error.message);
          return createResponse({ success: false, error: error.message }, 500);
        }
        
        // Update user wallet balance if needed and requested
        if (status === 'received' && walletTransfer.user_id && creditWallet) {
          await updateUserWalletBalance(supabase, walletTransfer.user_id, walletTransfer.amount);
          
          // Send notification if requested
          if (sendNotification) {
            await sendUserNotification(supabase, walletTransfer.user_id, { 
              amount: walletTransfer.amount,
              reference: walletTransfer.description
            });
          }
        }
        
        return createResponse({ success: true, data });
      }
    }
      
    if (checkError) {
      console.error("Error checking transfer:", checkError?.message);
      return createResponse({ 
        success: false, 
        error: checkError?.message 
      }, 500);
    }
    
    if (!existingTransfer) {
      console.error("Transfer not found with ID:", transferId);
      return createResponse({ 
        success: false, 
        error: "Transfer not found" 
      }, 404);
    }

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
        .select();
      
      if (error) {
        console.error("Direct update failed:", error.message);
        return createResponse({ success: false, error: error.message }, 500);
      }

      console.log("Update successful via direct update");
      
      // Update user wallet balance if needed and should credit wallet
      const userIdToUpdate = userId || existingTransfer.user_id;
      const transferAmount = existingTransfer.amount || 0;
      
      if (userIdToUpdate && (status === 'received' || status === 'reçu') && creditWallet) {
        await updateUserWalletBalance(supabase, userIdToUpdate, transferAmount);
        
        // Send notification if requested and status is received
        if (sendNotification) {
          await sendUserNotification(supabase, userIdToUpdate, existingTransfer);
        }
      }
      
      return createResponse({ success: true, data });
    }

    console.log("Update successful via RPC");
    
    // Check if we need to update the user's wallet balance
    const userIdToUpdate = userId || existingTransfer.user_id;
    const transferAmount = existingTransfer.amount || 0;
    
    if (userIdToUpdate && (status === 'received' || status === 'reçu') && creditWallet) {
      await updateUserWalletBalance(supabase, userIdToUpdate, transferAmount);
      
      // Send notification if requested and status is received
      if (sendNotification) {
        await sendUserNotification(supabase, userIdToUpdate, existingTransfer);
      }
    }
    
    // Make sure we return the updated transfer data
    const { data: updatedTransfer, error: getUpdatedError } = await supabase
      .from('bank_transfers')
      .select('*')
      .eq('id', transferId)
      .maybeSingle();
      
    if (getUpdatedError) {
      console.warn("Couldn't fetch updated transfer:", getUpdatedError.message);
    }
    
    // Send success response
    return createResponse({ 
      success: true, 
      data: updatedTransfer || rpcResult || { id: transferId, status, processed: isProcessed }
    });

  } catch (error: any) {
    console.error("Edge function error:", error.message);
    return createResponse({ success: false, error: error.message }, 500);
  }
});
