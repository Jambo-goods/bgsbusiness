
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
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters: transferId and status are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing bank transfer update: ID=${transferId}, Status=${status}, Processed=${isProcessed}, CreditWallet=${creditWallet}`);

    // First try to find the transfer in bank_transfers
    const { data: existingTransfer, error: checkError } = await supabase
      .from('bank_transfers')
      .select('id, user_id, amount')
      .eq('id', transferId)
      .maybeSingle();
      
    // If not found in bank_transfers, check wallet_transactions
    if (!existingTransfer && !checkError) {
      const { data: walletTransfer, error: walletError } = await supabase
        .from('wallet_transactions')
        .select('id, user_id, amount')
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
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Update user wallet balance if needed and requested
        if (status === 'received' && walletTransfer.user_id && creditWallet) {
          await updateUserWalletBalance(supabase, walletTransfer.user_id, walletTransfer.amount);
          
          // Send notification if requested
          if (sendNotification) {
            await sendUserNotification(supabase, walletTransfer.user_id, { amount: walletTransfer.amount });
          }
        }
        
        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
      
    if (checkError) {
      console.error("Error checking transfer:", checkError?.message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: checkError?.message 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!existingTransfer) {
      console.error("Transfer not found with ID:", transferId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Transfer not found" 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get transfer details to include in notification
    const { data: transfer, error: transferError } = await supabase
      .from('bank_transfers')
      .select('amount, reference')
      .eq('id', transferId)
      .maybeSingle();
      
    if (transferError) {
      console.error("Error fetching transfer details:", transferError.message);
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
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Update successful via direct update");
      
      // Update user wallet balance if needed and should credit wallet
      const userIdToUpdate = userId || existingTransfer.user_id;
      const transferAmount = transfer?.amount || existingTransfer.amount || 0;
      
      if (userIdToUpdate && (status === 'received' || status === 'reçu') && creditWallet) {
        await updateUserWalletBalance(supabase, userIdToUpdate, transferAmount);
        
        // Send notification if requested and status is received
        if (sendNotification) {
          await sendUserNotification(supabase, userIdToUpdate, transfer || { amount: transferAmount });
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Update successful via RPC");
    
    // Check if we need to update the user's wallet balance
    const userIdToUpdate = userId || existingTransfer.user_id;
    const transferAmount = transfer?.amount || existingTransfer.amount || 0;
    
    if (userIdToUpdate && (status === 'received' || status === 'reçu') && creditWallet) {
      await updateUserWalletBalance(supabase, userIdToUpdate, transferId, transferAmount);
      
      // Send notification if requested and status is received
      if (sendNotification) {
        await sendUserNotification(supabase, userIdToUpdate, transfer || { amount: transferAmount });
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
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: updatedTransfer || rpcResult || { id: transferId, status, processed: isProcessed }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Edge function error:", error.message);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Updated helper function to update the user's wallet balance
async function updateUserWalletBalance(supabase: any, userId: string, transferId: string | number, amount?: number) {
  try {
    console.log(`Updating wallet balance for user ${userId}`);
    
    let transferAmount = amount;
    
    // If amount not provided directly, try to get it from the transfer
    if (transferAmount === undefined && typeof transferId === 'string') {
      // Get the transfer to check the amount
      const { data: transfer, error: transferError } = await supabase
        .from('bank_transfers')
        .select('amount')
        .eq('id', transferId)
        .maybeSingle();
      
      if (transferError) {
        console.error("Error fetching transfer:", transferError.message);
      } else {
        transferAmount = transfer?.amount;
      }
    }
    
    // If we have a valid amount, directly increment the wallet balance first
    if (transferAmount !== undefined && transferAmount > 0) {
      // Direct increment has higher priority for immediate feedback
      const { error: incrementError } = await supabase.rpc('increment_wallet_balance', {
        user_id: userId,
        increment_amount: transferAmount
      });
      
      if (incrementError) {
        console.error("Increment wallet balance failed:", incrementError.message);
      } else {
        console.log(`Successfully incremented wallet balance by ${transferAmount}`);
        
        // Also create or update a wallet transaction to ensure visibility in transaction history
        const { data: existingTransaction } = await supabase
          .from('wallet_transactions')
          .select('id')
          .eq('user_id', userId)
          .eq('amount', transferAmount)
          .eq('type', 'deposit')
          .limit(1);
          
        if (existingTransaction && existingTransaction.length > 0) {
          // Update existing transaction to completed status
          await supabase
            .from('wallet_transactions')
            .update({
              status: 'completed',
              receipt_confirmed: true
            })
            .eq('id', existingTransaction[0].id);
        } else {
          // Create a new transaction for this deposit
          await supabase
            .from('wallet_transactions')
            .insert({
              user_id: userId,
              amount: transferAmount,
              type: 'deposit',
              description: 'Dépôt de fonds (virement bancaire)',
              receipt_confirmed: true,
              status: 'completed'
            });
        }
        
        return; // Exit early as we've already updated the balance
      }
    }
    
    // Fallback to recalculation function if direct increment didn't work
    const { error: recalcError } = await supabase.rpc('recalculate_wallet_balance', {
      user_uuid: userId
    });
    
    if (recalcError) {
      console.error("Recalculate wallet balance failed:", recalcError.message);
    } else {
      console.log("Successfully recalculated wallet balance");
    }
  } catch (error: any) {
    console.error("Error updating wallet balance:", error.message);
  }
}

// Helper function to send notification to the user
async function sendUserNotification(supabase: any, userId: string, transfer: any) {
  try {
    if (!transfer) {
      console.log("No transfer details available for notification");
      return;
    }

    const amount = transfer.amount || 0;
    const reference = transfer.reference || '';
    
    console.log(`Sending virement notification to user ${userId} for amount ${amount}`);
    
    // Create notification for user dashboard
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: "Virement bancaire reçu",
        message: `Votre virement bancaire de ${amount}€${reference ? ` (réf: ${reference})` : ''} a été confirmé et ajouté à votre portefeuille.`,
        type: "deposit",
        seen: false,
        data: {
          category: "success",
          amount,
          reference,
          timestamp: new Date().toISOString()
        }
      });
    
    if (notificationError) {
      console.error("Error creating notification:", notificationError.message);
    } else {
      console.log("Successfully created notification for user");
    }
    
    // Create or update wallet transaction for transaction history
    const { data: existingTransaction, error: txCheckError } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('description', `Virement bancaire${reference ? ` (${reference})` : ''}`)
      .eq('type', 'deposit')
      .limit(1);
      
    if (txCheckError) {
      console.error("Error checking for existing transaction:", txCheckError.message);
    }
    
    if (existingTransaction && existingTransaction.length > 0) {
      // Update existing transaction
      const { error: txUpdateError } = await supabase
        .from('wallet_transactions')
        .update({
          amount: amount,
          receipt_confirmed: true,
          status: 'completed'
        })
        .eq('id', existingTransaction[0].id);
        
      if (txUpdateError) {
        console.error("Error updating wallet transaction:", txUpdateError.message);
      } else {
        console.log(`Updated existing wallet transaction with ID ${existingTransaction[0].id}`);
      }
    } else {
      // Create new transaction
      const { error: txInsertError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'deposit',
          description: `Virement bancaire${reference ? ` (${reference})` : ''}`,
          receipt_confirmed: true,
          status: 'completed'
        });
        
      if (txInsertError) {
        console.error("Error creating wallet transaction:", txInsertError.message);
      } else {
        console.log("Created new wallet transaction for deposit");
      }
    }
    
  } catch (error: any) {
    console.error("Error sending user notification:", error.message);
  }
}
