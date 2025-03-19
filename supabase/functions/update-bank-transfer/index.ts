
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/deploy/docs/tutorial-node

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

  try {
    // Get the request data
    const requestData: UpdateRequest = await req.json();
    
    console.log(`Edge Function: Updating bank transfer ${requestData.transferId}`);
    console.log(`Status: ${requestData.status}, Processed: ${requestData.processed}, Date: ${requestData.processedAt}`);
    
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
    
    // CRITICAL: ALWAYS Force status changes for 'received'/'reçu' to set processed=true
    let processed = requestData.status === 'received' || requestData.status === 'reçu' ? true : requestData.processed;
    
    // CRITICAL: If processedAt is null and status is 'received'/'reçu', use current timestamp
    let processedAt = requestData.processedAt;
    if ((requestData.status === 'received' || requestData.status === 'reçu') && !processedAt) {
      processedAt = new Date().toISOString();
      console.log("Setting processed_at to current timestamp:", processedAt);
    }
    
    // Get existing record to ensure we have all necessary data
    const { data: existingTransfer, error: fetchError } = await supabaseClient
      .from('bank_transfers')
      .select('*')
      .eq('id', requestData.transferId)
      .single();
      
    if (fetchError) {
      console.error("Failed to fetch bank transfer:", fetchError.message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: fetchError.message,
          message: "Failed to fetch bank transfer"
        }),
        { headers, status: 404 }
      );
    }
    
    console.log("Existing bank transfer:", existingTransfer);
    
    // Direct database update with explicit parameters
    const { data, error } = await supabaseClient
      .from('bank_transfers')
      .update({
        status: requestData.status,
        processed: processed,
        processed_at: processedAt,
        notes: requestData.notes
      })
      .eq('id', requestData.transferId)
      .select();
    
    if (error) {
      console.error("Database update failed:", error.message);
      console.error("Error details:", error.details);
      
      // Fallback - try another update approach with a fresh client
      const freshClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      // Fallback method - try raw SQL update
      const sqlQuery = `
        UPDATE bank_transfers 
        SET 
          status = '${requestData.status}',
          processed = ${processed},
          processed_at = ${processedAt ? `'${processedAt}'` : 'NULL'},
          notes = '${requestData.notes.replace(/'/g, "''")}'
        WHERE id = '${requestData.transferId}'
        RETURNING *;
      `;
      
      console.log("Executing fallback SQL update:", sqlQuery);
      
      const { data: sqlData, error: sqlError } = await freshClient.rpc('exec_sql', { 
        query: sqlQuery 
      });
      
      if (sqlError) {
        console.error("SQL fallback update failed:", sqlError.message);
        
        // Last resort - try direct fetch and upsert
        const { data: existingData } = await freshClient
          .from('bank_transfers')
          .select('*')
          .eq('id', requestData.transferId)
          .single();
          
        if (existingData) {
          // Prepare complete record for upsert
          const upsertData = {
            ...existingData,
            status: requestData.status,
            processed: processed,
            processed_at: processedAt,
            notes: requestData.notes
          };
          
          console.log("Attempting upsert with full record:", upsertData);
          
          const { error: upsertError } = await freshClient
            .from('bank_transfers')
            .upsert(upsertData);
            
          if (upsertError) {
            console.error("Upsert fallback failed:", upsertError.message);
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: "All update attempts failed",
                message: "Failed to update bank transfer status after multiple attempts"
              }),
              { headers, status: 500 }
            );
          }
        }
      }
    }
    
    // Verify the update was successful with a fresh query
    const { data: verifyData, error: verifyError } = await supabaseClient
      .from('bank_transfers')
      .select('status, processed, processed_at, notes, user_id, amount, reference')
      .eq('id', requestData.transferId)
      .single();
      
    if (verifyError) {
      console.error("Verification failed:", verifyError.message);
      return new Response(
        JSON.stringify({ 
          success: false,
          verified: false,
          error: `Verification failed: ${verifyError.message}`,
          message: 'Status update was attempted but verification failed'
        }),
        { headers, status: 500 }
      );
    }
    
    // Final verification if status matches what was requested
    const statusMatches = verifyData.status === requestData.status;
    const processedMatches = (verifyData.processed === processed) || 
                             (requestData.status === 'received' && verifyData.processed === true);
    
    console.log("Verification results:", {
      requestedStatus: requestData.status,
      currentStatus: verifyData.status,
      statusMatches,
      requestedProcessed: processed,
      currentProcessed: verifyData.processed,
      processedMatches
    });
    
    // If transfer is received, update wallet balance and create notifications
    if ((requestData.status === 'received' || requestData.status === 'reçu') && 
        (statusMatches && verifyData.processed)) {
      console.log("Transfer is now received, updating wallet and creating notifications");
      
      try {
        // Recalculate wallet balance
        await supabaseClient.rpc('recalculate_wallet_balance', {
          user_uuid: verifyData.user_id
        });
        
        console.log(`Wallet balance recalculated for user ${verifyData.user_id}`);
        
        // Create notification for the user
        const { error: notifyError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: verifyData.user_id,
            title: "Virement reçu",
            message: `Votre virement de ${verifyData.amount}€ (réf: ${verifyData.reference}) a été reçu et traité.`,
            type: "deposit",
            seen: false,
            data: {
              category: "success",
              amount: verifyData.amount,
              reference: verifyData.reference
            }
          });
          
        if (notifyError) {
          console.error("Error creating notification:", notifyError.message);
        } else {
          console.log("User notification created for received transfer");
        }
      } catch (walletError) {
        console.error("Error updating wallet balance:", walletError);
      }
    }
    
    // Return response with verification result
    return new Response(
      JSON.stringify({ 
        success: true, 
        verified: statusMatches && processedMatches,
        message: statusMatches && processedMatches 
          ? 'Bank transfer updated successfully' 
          : 'Bank transfer status update may have failed verification',
        currentStatus: verifyData.status,
        requestedStatus: requestData.status,
        processedDate: verifyData.processed_at,
        processed: verifyData.processed
      }),
      { headers }
    );
    
  } catch (error) {
    // Error response
    console.error("Unhandled error:", error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: "An unexpected error occurred updating the bank transfer"
      }),
      { headers, status: 500 }
    );
  }
});
