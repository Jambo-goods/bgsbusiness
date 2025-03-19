
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
    
    // CRITICAL: If processedAt is null and status is 'received', use current timestamp
    // This ensures the bank transfer is properly marked as processed
    if ((requestData.status === 'received' || requestData.status === 'reçu') && !requestData.processedAt) {
      console.log("Setting processed_at to current timestamp since it was missing");
      requestData.processedAt = new Date().toISOString();
    }
    
    // Method 1: Direct update with forced processed flag based on status
    const processed = requestData.status === 'received' || requestData.status === 'reçu';
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
      
      // Method 2: Try to fetch and then upsert
      console.log("Trying fetch and upsert method...");
      
      const { data: existingData, error: fetchError } = await supabaseClient
        .from('bank_transfers')
        .select('*')
        .eq('id', requestData.transferId)
        .single();
        
      if (fetchError) {
        console.error(`Failed to fetch bank transfer: ${fetchError.message}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to fetch bank transfer: ${fetchError.message}`
          }), 
          { headers, status: 400 }
        );
      }
      
      // Prepare the update data
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
        console.error(`Details: ${JSON.stringify(upsertError.details || {})}`);
        
        // Method 3: Try raw SQL update via RPC
        console.log("Trying direct SQL update method...");
        
        try {
          // Raw SQL to perform the update
          const { data: sqlData, error: sqlError } = await supabaseClient.rpc('force_update_bank_transfer', {
            transfer_id: requestData.transferId,
            new_status: requestData.status,
            processed_date: requestData.processedAt,
            processed_value: processed
          });
          
          if (sqlError) {
            console.error(`SQL update failed: ${sqlError.message}`);
            throw sqlError;
          }
        } catch (sqlError) {
          console.error(`All update methods failed: ${sqlError.message}`);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `All update methods failed: ${sqlError.message}`,
              originalError: upsertError.message
            }), 
            { headers, status: 500 }
          );
        }
      }
    }
    
    // Verify the update took effect
    console.log("Verifying update...");
    const { data: verifyData, error: verifyError } = await supabaseClient
      .from('bank_transfers')
      .select('*')
      .eq('id', requestData.transferId)
      .single();
      
    if (verifyError) {
      console.error(`Verification failed: ${verifyError.message}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Verification failed: ${verifyError.message}` 
        }),
        { headers, status: 500 }
      );
    }
    
    const wasUpdated = verifyData.status === requestData.status;
    
    if (!wasUpdated) {
      console.warn(`Update verification failed. Expected status: ${requestData.status}, Got: ${verifyData.status}`);
    } else {
      console.log(`Update verified successfully. Status is now: ${verifyData.status}`);
      
      // Create user notification if update was successful
      try {
        // But only if the status is something meaningful to notify about
        if (['received', 'completed', 'rejected'].includes(requestData.status) && verifyData.user_id) {
          const notificationTitle = requestData.status === 'rejected' 
            ? "Virement rejeté" 
            : "Virement reçu";
            
          const notificationMessage = requestData.status === 'rejected'
            ? `Votre virement bancaire (réf: ${verifyData.reference}) a été rejeté.`
            : `Votre virement de ${verifyData.amount}€ (réf: ${verifyData.reference}) a été reçu et traité.`;
          
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: verifyData.user_id,
              title: notificationTitle,
              message: notificationMessage,
              type: "deposit",
              seen: false,
              data: {
                category: requestData.status === 'rejected' ? "error" : "success",
                amount: verifyData.amount,
                reference: verifyData.reference
              }
            });
            
          console.log("User notification created");
          
          // If transaction is received, update wallet balance
          if (requestData.status === 'received' || requestData.status === 'completed') {
            try {
              await supabaseClient.rpc('recalculate_wallet_balance', {
                user_uuid: verifyData.user_id
              });
              console.log(`Wallet balance recalculated for user ${verifyData.user_id}`);
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
