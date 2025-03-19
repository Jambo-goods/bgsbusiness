
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
      // Supabase API URL - env var exported by default
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API SERVICE ROLE KEY - env var exported by default
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      // Create client with Auth context of the user that called the function
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // CRITICAL: Force status changes for 'received'/'reçu' to set processed=true and ensure a timestamp
    const processed = requestData.status === 'received' || requestData.status === 'reçu' ? true : requestData.processed;
    
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
    
    let updateSuccess = false;
    let updateMethod = "unknown";
    
    // First attempt: Using immediate direct update
    try {
      console.log("Attempt 1: Direct update with full payload");
      const updatePayload = {
        status: requestData.status,
        processed: processed,
        processed_at: processedAt,
        notes: requestData.notes
      };
      
      const { data: updateData, error: updateError } = await supabaseClient
        .from('bank_transfers')
        .update(updatePayload)
        .eq('id', requestData.transferId)
        .select();
        
      if (!updateError && updateData) {
        console.log("Direct update succeeded:", updateData);
        updateSuccess = true;
        updateMethod = "direct_update";
      } else if (updateError) {
        console.error("Direct update failed:", updateError);
      }
    } catch (directError) {
      console.error("Exception during direct update:", directError);
    }
    
    // Second attempt: Try a direct SQL update via RPC if available
    if (!updateSuccess) {
      try {
        console.log("Attempt 2: SQL direct update via RPC");
        
        const { data: sqlData, error: sqlError } = await supabaseClient.rpc('exec_sql', { 
          query: `
            UPDATE bank_transfers 
            SET 
              status = '${requestData.status}',
              processed = ${processed},
              processed_at = ${processedAt ? `'${processedAt}'` : 'NULL'},
              notes = '${requestData.notes.replace(/'/g, "''")}'
            WHERE id = '${requestData.transferId}'
            RETURNING *;
          `
        });
        
        if (!sqlError && sqlData) {
          console.log("SQL direct update succeeded:", sqlData);
          updateSuccess = true;
          updateMethod = "sql_rpc";
        } else if (sqlError) {
          console.error("SQL direct update failed:", sqlError);
        }
      } catch (sqlError) {
        console.error("Exception during SQL update:", sqlError);
      }
    }
    
    // Third attempt: Try full upsert as fallback
    if (!updateSuccess) {
      try {
        console.log("Attempt 3: Full upsert");
        
        const fullRecord = {
          ...existingTransfer,
          status: requestData.status,
          processed: processed,
          processed_at: processedAt,
          notes: requestData.notes
        };
        
        const { data: upsertData, error: upsertError } = await supabaseClient
          .from('bank_transfers')
          .upsert(fullRecord)
          .select();
          
        if (!upsertError && upsertData) {
          console.log("Upsert succeeded:", upsertData);
          updateSuccess = true;
          updateMethod = "upsert";
        } else if (upsertError) {
          console.error("Upsert failed:", upsertError);
        }
      } catch (upsertError) {
        console.error("Exception during upsert:", upsertError);
      }
    }
    
    // Last resort: Direct table access with admin privileges
    if (!updateSuccess) {
      try {
        console.log("Attempt 4: Admin client privileged update");
        
        const adminClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        );
        
        const { data: adminUpdateData, error: adminUpdateError } = await adminClient
          .from('bank_transfers')
          .update({
            status: requestData.status,
            processed: processed,
            processed_at: processedAt,
            notes: requestData.notes
          })
          .eq('id', requestData.transferId)
          .select();
          
        if (!adminUpdateError && adminUpdateData) {
          console.log("Admin update succeeded:", adminUpdateData);
          updateSuccess = true;
          updateMethod = "admin_update";
        } else if (adminUpdateError) {
          console.error("Admin update failed:", adminUpdateError);
        }
      } catch (adminError) {
        console.error("Exception during admin update:", adminError);
      }
    }
    
    // Wait a short time for database changes to propagate
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify the update was successful by fetching latest record
    const { data: verifyData, error: verifyError } = await supabaseClient
      .from('bank_transfers')
      .select('status, processed, processed_at, notes, user_id, amount, reference')
      .eq('id', requestData.transferId)
      .single();
      
    if (verifyError) {
      console.error("Verification failed:", verifyError.message);
      
      // Final fallback: try with the admin client
      const adminClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const { data: adminVerifyData, error: adminVerifyError } = await adminClient
        .from('bank_transfers')
        .select('status, processed, processed_at, notes, user_id, amount, reference')
        .eq('id', requestData.transferId)
        .single();
        
      if (adminVerifyError) {
        return new Response(
          JSON.stringify({ 
            success: updateSuccess,
            updateMethod,
            verified: false,
            error: "Verification failed with both clients",
            message: "Failed to verify bank transfer update"
          }),
          { headers, status: 500 }
        );
      }
      
      console.log("Admin verification succeeded:", adminVerifyData);
      
      // Use the admin verification data
      const verifiedData = adminVerifyData;
      
      // Check if update was actually applied
      const statusMatches = verifiedData.status === requestData.status;
      const processedMatches = verifiedData.processed === processed;
      
      console.log("Verification results:", {
        requestedStatus: requestData.status,
        currentStatus: verifiedData.status,
        statusMatches,
        requestedProcessed: processed,
        currentProcessed: verifiedData.processed,
        processedMatches,
        updateMethod
      });
      
      // If transfer is now received, update wallet balance and send notifications
      if ((requestData.status === 'received' || requestData.status === 'reçu') && statusMatches) {
        try {
          // Recalculate wallet balance
          await supabaseClient.rpc('recalculate_wallet_balance', {
            user_uuid: verifiedData.user_id
          });
          
          console.log(`Wallet balance recalculated for user ${verifiedData.user_id}`);
          
          // Create notification for the user
          const { error: notifyError } = await supabaseClient
            .from('notifications')
            .insert({
              user_id: verifiedData.user_id,
              title: "Virement reçu",
              message: `Votre virement de ${verifiedData.amount}€ (réf: ${verifiedData.reference}) a été reçu et traité.`,
              type: "deposit",
              data: {
                category: "success",
                amount: verifiedData.amount,
                reference: verifiedData.reference
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
      
      return new Response(
        JSON.stringify({ 
          success: updateSuccess,
          updateMethod,
          verified: statusMatches && processedMatches,
          message: statusMatches && processedMatches 
            ? 'Bank transfer updated successfully' 
            : 'Bank transfer status update may have failed verification',
          currentStatus: verifiedData.status,
          requestedStatus: requestData.status,
          processedDate: verifiedData.processed_at,
          processed: verifiedData.processed
        }),
        { headers }
      );
    }
    
    console.log("Verified bank transfer state:", verifyData);
    
    // Check if update was actually applied
    const statusMatches = verifyData.status === requestData.status;
    const processedMatches = verifyData.processed === processed;
    
    console.log("Verification results:", {
      requestedStatus: requestData.status,
      currentStatus: verifyData.status,
      statusMatches,
      requestedProcessed: processed,
      currentProcessed: verifyData.processed,
      processedMatches,
      updateMethod
    });
    
    // If transfer is now received, update wallet balance and send notifications
    if ((requestData.status === 'received' || requestData.status === 'reçu') && statusMatches) {
      try {
        // Guarantee an update to processed and processed_at with another attempt
        if (!statusMatches || !processedMatches) {
          console.log("Critical fields don't match! Making one final forced update...");
          
          const adminClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          );
          
          const finalUpdate = {
            status: requestData.status,
            processed: true,
            processed_at: processedAt || new Date().toISOString(),
            notes: requestData.notes || "Forcibly updated by Edge Function"
          };
          
          await adminClient
            .from('bank_transfers')
            .update(finalUpdate)
            .eq('id', requestData.transferId);
            
          console.log("Forced final update completed");
        }
        
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
    
    return new Response(
      JSON.stringify({ 
        success: updateSuccess,
        updateMethod,
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
