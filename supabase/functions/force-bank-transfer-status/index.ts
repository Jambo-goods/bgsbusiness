
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
    
    // Update the bank transfer status
    const updatedTransfer = {
      ...fullTransfer,
      status: newStatus,
      processed: true,
      processed_at: new Date().toISOString(),
      notes: (fullTransfer.notes || '') + ' | Force updated via Edge Function on ' + new Date().toLocaleString()
    }
    
    console.log("Updating transfer with:", updatedTransfer)
    
    const { error: updateError } = await supabaseAdmin
      .from('bank_transfers')
      .upsert(updatedTransfer)
      
    if (updateError) {
      console.error("Error updating bank transfer:", updateError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error updating bank transfer: ${updateError.message}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Verify the update
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
        success: checkData.status === newStatus,
        message: checkData.status === newStatus 
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
