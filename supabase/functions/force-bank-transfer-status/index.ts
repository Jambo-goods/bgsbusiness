
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { transferId, newStatus, forceWalletRecalculation, forceWalletUpdate, amount, userId, transferData } = await req.json()
    
    // Create Supabase client with service role key (has admin privileges)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log(`Starting force update for bank transfer ${transferId} to status ${newStatus}`)
    console.log(`Environment check - SUPABASE_URL: ${Deno.env.get('SUPABASE_URL') ? 'exists' : 'missing'}`)
    console.log(`Environment check - SERVICE_ROLE: ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'exists' : 'missing'}`)
    
    // First, try using our new database function that bypasses RLS
    try {
      console.log("Attempting update with force_bank_transfer_status database function")
      const { data: functionData, error: functionError } = await supabaseAdmin.rpc(
        'force_bank_transfer_status',
        { 
          transfer_id: transferId, 
          new_status: newStatus || 'received'
        }
      );
      
      if (functionError) {
        console.error("Error with force_bank_transfer_status function:", functionError);
      } else {
        console.log("Database function update successful:", functionData);
        
        // If successful, get the updated record data
        const { data: updatedTransfer } = await supabaseAdmin
          .from('bank_transfers')
          .select('status, user_id, amount, reference')
          .eq('id', transferId)
          .single();
          
        return new Response(
          JSON.stringify({
            success: true,
            message: "Bank transfer successfully updated using database function",
            userId: updatedTransfer?.user_id,
            amount: updatedTransfer?.amount,
            reference: updatedTransfer?.reference
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (fnError) {
      console.error("Exception in database function execution:", fnError);
    }
    
    // Fallback to admin_update_bank_transfer if first function failed
    try {
      console.log("Attempting update with admin_update_bank_transfer database function")
      const { data: adminFnData, error: adminFnError } = await supabaseAdmin.rpc(
        'admin_update_bank_transfer',
        { 
          transfer_id: transferId, 
          new_status: newStatus || 'received',
          processed: true,
          notes: 'Forced update via Edge Function on ' + new Date().toLocaleString()
        }
      );
      
      if (adminFnError) {
        console.error("Error with admin_update_bank_transfer function:", adminFnError);
      } else {
        console.log("Admin database function update successful:", adminFnData);
        
        // If successful, get the updated record data
        const { data: updatedTransfer } = await supabaseAdmin
          .from('bank_transfers')
          .select('status, user_id, amount, reference')
          .eq('id', transferId)
          .single();
          
        return new Response(
          JSON.stringify({
            success: true,
            message: "Bank transfer successfully updated using admin database function",
            userId: updatedTransfer?.user_id,
            amount: updatedTransfer?.amount,
            reference: updatedTransfer?.reference
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (adminFnError) {
      console.error("Exception in admin database function execution:", adminFnError);
    }
    
    // First, get the full record data if not provided
    let fullTransfer = transferData
    if (!fullTransfer) {
      const { data: fetchedData, error: fetchError } = await supabaseAdmin
        .from('bank_transfers')
        .select('*')
        .eq('id', transferId)
        .single()
        
      if (fetchError) {
        console.error("Error fetching transfer data:", fetchError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Error fetching transfer data: ${fetchError.message}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      fullTransfer = fetchedData
    }
    
    // Update wallet balance directly if requested
    if (forceWalletUpdate && userId && amount) {
      try {
        console.log(`Forcing wallet update for user ${userId} with amount ${amount}`)
        
        // First get current balance
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('wallet_balance')
          .eq('id', userId)
          .single()
        
        if (profileError) {
          console.error("Error fetching profile:", profileError)
        } else if (profile) {
          // Calculate new balance
          const newBalance = (profile.wallet_balance || 0) + amount
          
          // Update profile directly
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ wallet_balance: newBalance })
            .eq('id', userId)
            
          if (updateError) {
            console.error("Error updating wallet balance:", updateError)
          } else {
            console.log(`Wallet balance updated to ${newBalance}`)
          }
        }
      } catch (e) {
        console.error("Error updating wallet:", e)
      }
    }
    
    // Recalculate wallet balance if requested (using existing DB function)
    if (forceWalletRecalculation && fullTransfer.user_id) {
      try {
        console.log(`Recalculating wallet balance for user ${fullTransfer.user_id}`)
        
        const { data, error } = await supabaseAdmin.rpc('recalculate_wallet_balance', {
          user_uuid: fullTransfer.user_id
        })
        
        if (error) {
          console.error("Error recalculating wallet balance:", error)
        } else {
          console.log("Wallet balance recalculated successfully")
        }
      } catch (e) {
        console.error("Error with recalculate_wallet_balance RPC:", e)
      }
    }
    
    // Prepare the update data with the most critical fields
    const updateData = {
      id: fullTransfer.id,  // Primary key must be included
      status: newStatus,
      processed: true,
      processed_at: new Date().toISOString(),
      notes: (fullTransfer.notes || '') + ' | Force updated via Edge Function on ' + new Date().toLocaleString()
    };
    
    console.log("Updating transfer with:", updateData)
    
    // First try with direct SQL for maximum control and bypass all RLS
    try {
      // Use SQL directly with the admin client to bypass any issues
      const { data: sqlData, error: sqlError } = await supabaseAdmin.rpc(
        'admin_update_bank_transfer',
        { 
          transfer_id: transferId, 
          new_status: newStatus,
          processed: true,
          notes: updateData.notes
        }
      );
      
      if (sqlError) {
        console.error("Error with direct SQL update:", sqlError);
      } else {
        console.log("SQL update successful:", sqlData);
      }
    } catch (sqlExecError) {
      console.error("Exception in SQL execution:", sqlExecError);
    }
    
    // Fallback to regular update if RPC is not available
    const { error: updateError } = await supabaseAdmin
      .from('bank_transfers')
      .update(updateData)
      .eq('id', transferId);
      
    if (updateError) {
      console.error("Error updating bank transfer via update:", updateError);
      
      // Try a second approach with upsert if update fails
      console.log("Attempting upsert as fallback...");
      const { error: upsertError } = await supabaseAdmin
        .from('bank_transfers')
        .upsert(updateData);
        
      if (upsertError) {
        console.error("Upsert also failed:", upsertError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Failed all update attempts. Last error: ${upsertError.message}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Verify the update
    const { data: checkData, error: checkError } = await supabaseAdmin
      .from('bank_transfers')
      .select('status, user_id, amount, reference')
      .eq('id', transferId)
      .single();
      
    if (checkError) {
      console.error("Error verifying update:", checkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error verifying update: ${checkError.message}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Return success result with user data for notification
    return new Response(
      JSON.stringify({
        success: checkData.status === newStatus,
        message: checkData.status === newStatus 
          ? "Bank transfer successfully updated to received" 
          : `Failed to update status. Current status: ${checkData.status}`,
        userId: checkData.user_id,
        amount: checkData.amount,
        reference: checkData.reference
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Critical error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
