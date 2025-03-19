
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

    console.log(`Starting force update for bank transfer ${transferId} to status ${newStatus || 'received'}`)
    console.log(`Environment check - SUPABASE_URL: ${Deno.env.get('SUPABASE_URL') ? 'exists' : 'missing'}`)
    console.log(`Environment check - SERVICE_ROLE: ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'exists' : 'missing'}`)
    
    // First, try using our dedicated database function that bypasses RLS (highest chance of success)
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
      } else if (functionData === true) {
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
      } else if (adminFnData === true) {
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
    
    // Next, get the full record data if not provided
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
    
    // Try a completely different approach with a DELETE + INSERT
    try {
      console.log("Attempting DELETE + INSERT approach as an emergency measure...")
      
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
      
      if (deleteError) {
        console.error("Error during DELETE operation:", deleteError)
      } else {
        console.log("Successfully deleted record, now inserting with new status")
        
        // Then insert the modified version
        const { error: insertError } = await supabaseAdmin
          .from('bank_transfers')
          .insert(modifiedRecord)
          
        if (insertError) {
          console.error("Error during INSERT operation:", insertError)
          
          // Restore the original record if insertion failed
          const { error: restoreError } = await supabaseAdmin
            .from('bank_transfers')
            .insert(backupRecord)
            
          if (restoreError) {
            console.error("CRITICAL: Failed to restore original record:", restoreError)
          } else {
            console.log("Successfully restored original record after failed insertion")
          }
        } else {
          console.log("Successfully replaced record with new status via DELETE+INSERT")
          
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
        }
      }
    } catch (replaceError) {
      console.error("Exception during DELETE+INSERT approach:", replaceError)
    }
    
    // As absolute last resort, try direct SQL execution
    try {
      console.log("Attempting direct SQL execution as final measure...")
      
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
      
      if (sqlError) {
        console.error("Error with direct SQL execution:", sqlError)
      } else {
        console.log("SQL execution successful:", sqlData)
        
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
      console.error("Exception in SQL execution:", sqlExecError)
    }
    
    // Verify the update as a last step
    const { data: checkData, error: checkError } = await supabaseAdmin
      .from('bank_transfers')
      .select('status, user_id, amount, reference')
      .eq('id', transferId)
      .single()
      
    if (checkError) {
      console.error("Error verifying update:", checkError)
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
    console.error("Critical error:", error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
