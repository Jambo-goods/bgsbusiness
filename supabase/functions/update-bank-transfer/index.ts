
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/deploy/docs/tutorial-node

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

interface UpdateRequest {
  transferId: string;
  status: string;
  processed: boolean;
  processedAt: string | null;
  notes: string;
}

serve(async (req) => {
  // CORS headers to allow all origins
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json'
  };

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  // Create a Supabase client with the service role key
  const supabaseClient = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get('SUPABASE_URL') ?? '',
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    // Create client with Auth context of the user that called the function.
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  );

  try {
    // Get the request data
    const requestData: UpdateRequest = await req.json();
    
    console.log(`Edge Function: Updating bank transfer ${requestData.transferId}`);
    console.log(`Status: ${requestData.status}, Processed: ${requestData.processed}, Date: ${requestData.processedAt}`);
    
    // CRITICAL: If status is 'received' or 'reçu', set processed to true
    // This ensures consistent behavior across all updates
    const processed = requestData.status === 'received' || requestData.status === 'reçu';
    
    // CRITICAL: If processedAt is null and status is 'received', use current timestamp
    if ((requestData.status === 'received' || requestData.status === 'reçu') && !requestData.processedAt) {
      console.log("Setting processed_at to current timestamp since it was missing");
      requestData.processedAt = new Date().toISOString();
    }
    
    // Use multiple strategies for updating (each one is a fallback if the previous fails)
    // This maximizes the chance of a successful update
    
    // 1. Strategy: Direct SQL via functions.invoke for most reliability
    try {
      console.log("Attempting direct SQL update via RPC...");
      const { data: rpcData, error: rpcError } = await supabaseClient
        .rpc('force_update_bank_transfer', {
          transfer_id: requestData.transferId,
          new_status: requestData.status,
          processed_date: requestData.processedAt,
          processed_value: processed,
          notes_text: requestData.notes
        });
      
      if (rpcError) {
        console.error(`RPC update failed: ${rpcError.message}`);
        throw new Error(`RPC update failed: ${rpcError.message}`);
      }
      
      console.log("RPC update successful:", rpcData);
    } catch (rpcMethodError) {
      console.error("RPC method not available or failed:", rpcMethodError.message);
      
      // 2. Strategy: Direct update with REST API
      console.log("Falling back to direct update...");
      const { data: updateResult, error: updateError } = await supabaseClient
        .from('bank_transfers')
        .update({
          status: requestData.status,
          processed: processed,
          processed_at: requestData.processedAt,
          notes: requestData.notes
        })
        .eq('id', requestData.transferId);
      
      if (updateError) {
        console.error(`Direct update failed: ${updateError.message}`);
        console.error(`Details: ${JSON.stringify(updateError.details || {})}`);
        
        // 3. Strategy: Try to fetch and then upsert
        console.log("Trying fetch and upsert method...");
        
        const { data: existingData, error: fetchError } = await supabaseClient
          .from('bank_transfers')
          .select('*')
          .eq('id', requestData.transferId)
          .single();
          
        if (fetchError) {
          console.error(`Failed to fetch bank transfer: ${fetchError.message}`);
          throw new Error(`Failed to fetch bank transfer: ${fetchError.message}`);
        }
        
        // Prepare the update data - merging existing with new data
        const updateData = {
          ...existingData,
          status: requestData.status,
          processed: processed,
          processed_at: requestData.processedAt,
          notes: requestData.notes
        };
        
        // Use upsert with update resolution strategy
        const { data: upsertData, error: upsertError } = await supabaseClient
          .from('bank_transfers')
          .upsert(updateData, { 
            onConflict: 'id',
            ignoreDuplicates: false
          });
        
        if (upsertError) {
          console.error(`Upsert failed: ${upsertError.message}`);
          
          // 4. Strategy: Last resort - raw SQL via a different client approach
          console.log("Attempting direct SQL UPDATE...");
          
          // We'll use the service role for this direct approach
          const adminClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          );
          
          const query = `
            UPDATE bank_transfers 
            SET 
              status = '${requestData.status}',
              processed = ${processed},
              processed_at = ${requestData.processedAt ? `'${requestData.processedAt}'` : 'NULL'},
              notes = '${requestData.notes.replace(/'/g, "''")}'
            WHERE id = '${requestData.transferId}'
          `;
          
          try {
            const { data, error } = await adminClient.rpc('exec_sql', { sql_query: query });
            if (error) throw error;
            console.log("Direct SQL update result:", data);
          } catch (sqlError) {
            console.error(`SQL execution failed: ${sqlError.message}`);
            throw new Error(`All update methods failed. Last error: ${sqlError.message}`);
          }
        }
      }
    }
    
    // Wait a moment for changes to propagate
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify the update took effect
    console.log("Verifying update...");
    
    const { data: verifyData, error: verifyError } = await supabaseClient
      .from('bank_transfers')
      .select('status, processed, processed_at, notes')
      .eq('id', requestData.transferId)
      .single();
      
    if (verifyError) {
      console.error(`Verification failed: ${verifyError.message}`);
      return new Response(
        JSON.stringify({ 
          success: true,
          verified: false,
          error: `Verification failed: ${verifyError.message}`,
          message: 'Bank transfer update may have failed verification',
          currentStatus: 'unknown',
          requestedStatus: requestData.status,
          processedDate: null,
          processed: null
        }),
        { headers, status: 200 }
      );
    }
    
    const wasUpdated = verifyData.status === requestData.status;
    
    if (!wasUpdated) {
      console.warn(`Update verification failed. Expected status: ${requestData.status}, Got: ${verifyData.status}`);
    } else {
      console.log(`Update verified successfully. Status is now: ${verifyData.status}`);
      
      // Create user notification if update was successful
      if (['received', 'completed', 'rejected'].includes(requestData.status)) {
        try {
          // Get user ID from the bank transfer
          const { data: transferData, error: transferError } = await supabaseClient
            .from('bank_transfers')
            .select('user_id, reference, amount')
            .eq('id', requestData.transferId)
            .single();
            
          if (transferError) {
            console.error(`Failed to fetch transfer data for notification: ${transferError.message}`);
          } else if (transferData.user_id) {
            const notificationTitle = requestData.status === 'rejected' 
              ? "Virement rejeté" 
              : "Virement reçu";
              
            const notificationMessage = requestData.status === 'rejected'
              ? `Votre virement bancaire (réf: ${transferData.reference}) a été rejeté.`
              : `Votre virement de ${transferData.amount}€ (réf: ${transferData.reference}) a été reçu et traité.`;
            
            await supabaseClient
              .from('notifications')
              .insert({
                user_id: transferData.user_id,
                title: notificationTitle,
                message: notificationMessage,
                type: "deposit",
                seen: false,
                data: {
                  category: requestData.status === 'rejected' ? "error" : "success",
                  amount: transferData.amount,
                  reference: transferData.reference
                }
              });
              
            console.log("User notification created");
            
            // If transaction is received, update wallet balance
            if (requestData.status === 'received' || requestData.status === 'completed') {
              try {
                await supabaseClient.rpc('recalculate_wallet_balance', {
                  user_uuid: transferData.user_id
                });
                console.log(`Wallet balance recalculated for user ${transferData.user_id}`);
              } catch (walletError) {
                console.error(`Error updating wallet balance: ${walletError.message}`);
              }
            }
          }
        } catch (notifyError) {
          console.error(`Failed to create notification: ${notifyError.message}`);
          // Don't fail the whole operation if notification fails
        }
      }
    }
    
    // Success response with verification result
    return new Response(
      JSON.stringify({ 
        success: true, 
        verified: wasUpdated,
        message: wasUpdated 
          ? 'Bank transfer updated and verified successfully' 
          : 'Bank transfer update may have failed verification',
        currentStatus: verifyData.status,
        requestedStatus: requestData.status,
        processedDate: verifyData.processed_at,
        processed: verifyData.processed
      }),
      { headers }
    );
    
  } catch (error) {
    // Error response
    console.error(`Unhandled error: ${error.message}`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { headers, status: 500 }
    );
  }
});
