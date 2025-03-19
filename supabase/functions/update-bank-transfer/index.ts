
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
    
    // CRITICAL: FORCE status changes for 'received'/'reçu' to always set processed=true
    let processed = requestData.processed;
    if (requestData.status === 'received' || requestData.status === 'reçu') {
      processed = true;
      console.log("Status is 'received' or 'reçu', forcing processed=true");
    }
    
    // CRITICAL: If processedAt is null and status is 'received'/'reçu', use current timestamp
    let processedAt = requestData.processedAt;
    if ((requestData.status === 'received' || requestData.status === 'reçu') && !processedAt) {
      processedAt = new Date().toISOString();
      console.log("Setting processed_at to current timestamp:", processedAt);
    }
    
    // Try multiple update approaches in sequence for maximum reliability
    let updateSuccess = false;
    
    // 1. First attempt: Direct update with a single statement (highest likelihood of success)
    console.log("Attempting direct update with explicit values...");
    try {
      const { data, error } = await supabaseClient
        .from('bank_transfers')
        .update({
          status: requestData.status,
          processed: processed,
          processed_at: processedAt,
          notes: requestData.notes
        })
        .eq('id', requestData.transferId);
      
      if (error) {
        console.error("Direct update failed:", error.message);
      } else {
        console.log("Direct update succeeded");
        updateSuccess = true;
      }
    } catch (error) {
      console.error("Exception during direct update:", error.message);
    }
    
    // 2. Second attempt: If first failed, try update via RPC
    if (!updateSuccess) {
      console.log("First update failed, trying RPC approach...");
      try {
        // Creating a simple SQL statement via RPC to force update
        const sqlQuery = `
          UPDATE bank_transfers 
          SET 
            status = '${requestData.status}',
            processed = ${processed},
            processed_at = ${processedAt ? `'${processedAt}'` : 'NULL'},
            notes = '${requestData.notes.replace(/'/g, "''")}'
          WHERE id = '${requestData.transferId}'
        `;
        
        // Use a direct SQL execution if available
        const { data, error } = await supabaseClient.rpc('exec_sql', { sql_query: sqlQuery });
        
        if (error) {
          console.error("RPC approach failed:", error.message);
        } else {
          console.log("RPC update succeeded");
          updateSuccess = true;
        }
      } catch (error) {
        console.error("Exception during RPC update:", error.message);
      }
    }
    
    // 3. Third attempt: If previous methods failed, try upsert method
    if (!updateSuccess) {
      console.log("Previous update methods failed, trying upsert approach...");
      try {
        // First get existing record
        const { data: existingData, error: fetchError } = await supabaseClient
          .from('bank_transfers')
          .select('*')
          .eq('id', requestData.transferId)
          .single();
          
        if (fetchError) {
          console.error("Failed to fetch bank transfer:", fetchError.message);
        } else if (existingData) {
          // Prepare upsert data by merging existing with updates
          const upsertData = {
            ...existingData,
            status: requestData.status,
            processed: processed,
            processed_at: processedAt,
            notes: requestData.notes
          };
          
          // Try upsert operation
          const { data: upsertData, error: upsertError } = await supabaseClient
            .from('bank_transfers')
            .upsert(upsertData);
          
          if (upsertError) {
            console.error("Upsert failed:", upsertError.message);
          } else {
            console.log("Upsert succeeded");
            updateSuccess = true;
          }
        }
      } catch (error) {
        console.error("Exception during upsert:", error.message);
      }
    }
    
    // Wait a short time for database consistency before verification
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Verify the update was successful
    console.log("Verifying update...");
    
    const { data: verifyData, error: verifyError } = await supabaseClient
      .from('bank_transfers')
      .select('status, processed, processed_at, notes')
      .eq('id', requestData.transferId)
      .single();
      
    if (verifyError) {
      console.error("Verification failed:", verifyError.message);
      return new Response(
        JSON.stringify({ 
          success: updateSuccess,
          verified: false,
          error: `Verification failed: ${verifyError.message}`,
          message: 'Status update was attempted but verification failed',
          requestedStatus: requestData.status
        }),
        { headers }
      );
    }
    
    // Final verification if status matches what was requested
    const statusMatches = verifyData.status === requestData.status;
    const processedMatches = verifyData.processed === processed;
    
    if (!statusMatches || !processedMatches) {
      console.error(`Update verification failed. Status: ${verifyData.status} (expected ${requestData.status}), Processed: ${verifyData.processed} (expected ${processed})`);
      
      // Last resort: one more direct attempt if verification failed
      if (!statusMatches) {
        console.log("Attempting one final direct update as last resort...");
        try {
          // Use a fresh admin client for this attempt
          const adminClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          );
          
          const { error: finalError } = await adminClient
            .from('bank_transfers')
            .update({
              status: requestData.status,
              processed: processed,
              processed_at: processedAt,
              notes: requestData.notes + " (last resort update)"
            })
            .eq('id', requestData.transferId);
            
          if (finalError) {
            console.error("Final update attempt failed:", finalError.message);
          } else {
            console.log("Final update attempt succeeded");
            updateSuccess = true;
          }
        } catch (error) {
          console.error("Exception during final update attempt:", error.message);
        }
      }
    } else {
      console.log("Update verification successful!");
      
      // If transfer is received, update wallet balance
      if (requestData.status === 'received' || requestData.status === 'reçu') {
        try {
          // Get user ID and amount from the bank transfer
          const { data: transferData, error: transferError } = await supabaseClient
            .from('bank_transfers')
            .select('user_id, amount, reference')
            .eq('id', requestData.transferId)
            .single();
            
          if (transferError) {
            console.error("Failed to fetch transfer data for wallet update:", transferError.message);
          } else if (transferData) {
            // Recalculate wallet balance
            try {
              await supabaseClient.rpc('recalculate_wallet_balance', {
                user_uuid: transferData.user_id
              });
              console.log(`Wallet balance recalculated for user ${transferData.user_id}`);
              
              // Create notification for the user
              try {
                await supabaseClient
                  .from('notifications')
                  .insert({
                    user_id: transferData.user_id,
                    title: "Virement reçu",
                    message: `Votre virement de ${transferData.amount}€ (réf: ${transferData.reference}) a été reçu et traité.`,
                    type: "deposit",
                    seen: false,
                    data: {
                      category: "success",
                      amount: transferData.amount,
                      reference: transferData.reference
                    }
                  });
                console.log("User notification created for received transfer");
              } catch (notifyError) {
                console.error("Error creating notification:", notifyError.message);
              }
            } catch (walletError) {
              console.error("Error updating wallet balance:", walletError.message);
            }
          }
        } catch (userError) {
          console.error("Error fetching user data:", userError.message);
        }
      }
    }
    
    // Return response with verification result
    return new Response(
      JSON.stringify({ 
        success: updateSuccess, 
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
