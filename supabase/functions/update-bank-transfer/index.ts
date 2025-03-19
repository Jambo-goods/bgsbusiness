
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
    
    // Method 1: Try direct update first
    const { data: updateResult, error: updateError } = await supabaseClient
      .from('bank_transfers')
      .update({
        status: requestData.status,
        processed: requestData.processed,
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
        processed: requestData.processed,
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
        
        // Method 3: Try direct SQL as a last resort
        console.log("Trying direct SQL update method...");
        
        try {
          // Use RPC function if it exists
          const { data: rpcData, error: rpcError } = await supabaseClient.rpc('force_update_bank_transfer', {
            transfer_id: requestData.transferId,
            new_status: requestData.status,
            processed_date: requestData.processedAt,
            processed_value: requestData.processed,
            notes_text: requestData.notes
          });
          
          if (rpcError) {
            console.error(`RPC update failed: ${rpcError.message}`);
            
            // Method 4: Try with REST API for raw SQL
            console.log("Performing direct REST update as final fallback...");
            
            // Manual raw SQL execution via fetch directly to PostgREST
            const restUrl = `${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/force_update_bank_transfer`;
            const authKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
            
            const response = await fetch(restUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authKey}`,
                'apikey': authKey
              },
              body: JSON.stringify({
                transfer_id: requestData.transferId,
                new_status: requestData.status,
                processed_date: requestData.processedAt,
                processed_value: requestData.processed,
                notes_text: requestData.notes
              })
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`REST update failed: ${errorText}`);
            }
            
            console.log("REST update completed successfully");
          } else {
            console.log("RPC update completed successfully");
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
        requestedStatus: requestData.status
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
