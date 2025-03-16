
// This Supabase Edge Function monitors withdrawal_requests status changes
// and updates wallet balance when a withdrawal is scheduled

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  type: string
  table: string
  record: {
    id: string
    user_id: string
    amount: number
    status: string
  }
  old_record: {
    status: string
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  // Get environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

  // Initialize Supabase client with service role for admin privileges
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    const payload: WebhookPayload = await req.json()
    console.log('Webhook payload:', JSON.stringify(payload))

    // Only process withdrawal_requests table events
    if (payload.table !== 'withdrawal_requests') {
      return new Response(JSON.stringify({ message: 'Ignored: Not withdrawal_requests table' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Check if the status changed to "scheduled"
    if (
      payload.record.status === 'scheduled' && 
      payload.old_record.status !== 'scheduled'
    ) {
      const userId = payload.record.user_id
      const amount = payload.record.amount
      
      console.log(`Withdrawal scheduled for user ${userId}, amount: ${amount}`)
      
      // Update the user's wallet balance
      await supabaseAdmin.rpc('increment_wallet_balance', {
        user_id: userId,
        increment_amount: -amount,
      })
      
      console.log(`Successfully reduced wallet balance for user ${userId} by ${amount}`)
      
      // Create wallet transaction record
      await supabaseAdmin
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'withdrawal',
          description: 'Retrait programmé',
          status: 'completed',
        })
      
      console.log(`Successfully created wallet transaction record for withdrawal`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Wallet balance updated successfully',
          user_id: userId,
          amount: amount
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'No action needed for this status change',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing webhook:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
