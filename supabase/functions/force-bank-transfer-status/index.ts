
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
    
    // First, try using our dedicated database function that bypasses RLS (highest chance of success)
    try {
      const { data: functionData, error: functionError } = await supabaseAdmin.rpc(
        'force_bank_transfer_status',
        { 
          transfer_id: transferId, 
          new_status: newStatus || 'received'
        }
      );
      
      if (functionError) {
        // Error handled silently
      } else if (functionData === true) {
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
      // Error handled silently
    }
    
    // Fallback to admin_update_bank_transfer if first function failed
    try {
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
        // Error handled silently
      } else if (adminFnData === true) {
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
      // Error handled silently
    }
    
    // Next, get the full record data if not provided
    let fullTransfer = transferData
    if (!fullTransfer) {
      const { data: fetchedData, error: fetchError } = await supabaseAdmin
        .from('bank_transfers')
        .select('*')
        .eq('id', transferId)
        .single()
        
      if (fetchError) {
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
        // First get current balance
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('wallet_balance')
          .eq('id', userId)
          .single()
        
        if (!profileError && profile) {
          // Calculate new balance
          const newBalance = (profile.wallet_balance || 0) + amount
          
          // Update profile directly
          await supabaseAdmin
            .from('profiles')
            .update({ wallet_balance: newBalance })
            .eq('id', userId)
        }
      } catch (e) {
        // Error handled silently
      }
    }
    
    // Recalculate wallet balance if requested (using existing DB function)
    if (forceWalletRecalculation && fullTransfer.user_id) {
      try {
        await supabaseAdmin.rpc('recalculate_wallet_balance', {
          user_uuid: fullTransfer.user_id
        })
      } catch (e) {
        // Error handled silently
      }
    }
    
    // Try a completely different approach with a DELETE + INSERT
    try {
      // First, save a backup of the existing record
      const backupRecord = { ...fullTransfer }
      
      // Then modify the status for our insert
      const modifiedRecord = { 
        ...backupRecord,
        status: newStatus || 'received',
        processed: true,
        processed_at: new Date().toISOString(),
        notes: (backupRecord.notes || '') + ' | Force updated via Edge Function on ' + new Date().toLocaleString()
      }
      
      // First delete the existing record
      const { error: deleteError } = await supabaseAdmin
        .from('bank_transfers')
        .delete()
        .eq('id', transferId)
      
      if (!deleteError) {
        // Then insert the modified version
        const { error: insertError } = await supabaseAdmin
          .from('bank_transfers')
          .insert(modifiedRecord)
          
        if (!insertError) {
          // Verify the result
          const { data: checkData, error: checkError } = await supabaseAdmin
            .from('bank_transfers')
            .select('status, user_id, amount, reference')
            .eq('id', transferId)
            .single()
            
          if (!checkError && checkData.status === (newStatus || 'received')) {
            return new Response(
              JSON.stringify({
                success: true,
                message: "Bank transfer status updated using DELETE+INSERT approach",
                userId: checkData.user_id,
                amount: checkData.amount,
                reference: checkData.reference
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        } else {
          // Restore the original record if insertion failed
          await supabaseAdmin
            .from('bank_transfers')
            .insert(backupRecord)
        }
      }
    } catch (replaceError) {
      // Error handled silently
    }
    
    // As absolute last resort, try direct SQL execution
    try {
      const { data: sqlData, error: sqlError } = await supabaseAdmin.rpc(
        'execute_admin_sql',
        { 
          sql_command: `UPDATE bank_transfers 
                        SET status = '${newStatus || 'received'}', 
                            processed = true, 
                            processed_at = NOW(), 
                            notes = '${fullTransfer.notes || ''} | Force updated via SQL on ${new Date().toLocaleString()}'
                        WHERE id = '${transferId}'`
        }
      )
      
      if (!sqlError) {
        // Verify the update
        const { data: checkData, error: checkError } = await supabaseAdmin
          .from('bank_transfers')
          .select('status, user_id, amount, reference')
          .eq('id', transferId)
          .single()
          
        if (!checkError && checkData.status === (newStatus || 'received')) {
          return new Response(
            JSON.stringify({
              success: true,
              message: "Bank transfer status updated using direct SQL execution",
              userId: checkData.user_id,
              amount: checkData.amount,
              reference: checkData.reference
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    } catch (sqlExecError) {
      // Error handled silently
    }
    
    // Verify the update as a last step
    const { data: checkData, error: checkError } = await supabaseAdmin
      .from('bank_transfers')
      .select('status, user_id, amount, reference')
      .eq('id', transferId)
      .single()
      
    if (checkError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error verifying update: ${checkError.message}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Return success result with user data for notification
    return new Response(
      JSON.stringify({
        success: checkData.status === (newStatus || 'received'),
        message: checkData.status === (newStatus || 'received') 
          ? "Bank transfer successfully updated to received" 
          : `Failed to update status. Current status: ${checkData.status}`,
        userId: checkData.user_id,
        amount: checkData.amount,
        reference: checkData.reference
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
