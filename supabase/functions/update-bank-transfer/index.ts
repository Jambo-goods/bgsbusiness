
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
  // Create a Supabase client with the Auth context of the logged in user
  const supabaseClient = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get('SUPABASE_URL') ?? '',
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    // Create client with Auth context of the user that called the function.
    // This way your row-level security (RLS) policies are applied.
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  )

  // Get the request data
  const requestData: UpdateRequest = await req.json();
  
  try {
    console.log(`Edge Function: Updating bank transfer ${requestData.transferId}`);
    console.log(`Status: ${requestData.status}, Processed: ${requestData.processed}, Date: ${requestData.processedAt}`);
    
    // First attempt - get the current data
    const { data: existingData, error: fetchError } = await supabaseClient
      .from('bank_transfers')
      .select('*')
      .eq('id', requestData.transferId)
      .single();
      
    if (fetchError) {
      throw new Error(`Failed to fetch bank transfer: ${fetchError.message}`);
    }
    
    // Prepare the update
    const updateData = {
      ...existingData,
      status: requestData.status,
      processed: requestData.processed,
      processed_at: requestData.processedAt,
      notes: requestData.notes
    };
    
    // Use upsert to ensure the update succeeds
    const { data, error } = await supabaseClient
      .from('bank_transfers')
      .upsert(updateData);
      
    if (error) {
      // Try direct SQL as a last resort
      const { error: sqlError } = await supabaseClient.rpc('force_update_bank_transfer', {
        transfer_id: requestData.transferId,
        new_status: requestData.status,
        processed_date: requestData.processedAt,
        processed_value: requestData.processed
      });
      
      if (sqlError) {
        throw new Error(`SQL update failed: ${sqlError.message}`);
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'Bank transfer updated via SQL function' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Success response
    return new Response(
      JSON.stringify({ success: true, message: 'Bank transfer updated successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    // Error response
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    );
  }
})
