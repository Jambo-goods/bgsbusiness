
// send-withdrawal-notification/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
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
    console.log('send-withdrawal-notification function called')
    
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the request body
    const { user_id, amount, new_balance, withdrawal_id } = await req.json()
    
    console.log('Processing notification for user:', user_id, 'withdrawal:', withdrawal_id)
    
    if (!user_id || !withdrawal_id) {
      return new Response(
        JSON.stringify({ error: 'User ID and withdrawal ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the withdrawal request details
    const { data: withdrawal, error: withdrawalError } = await supabaseClient
      .from('withdrawal_requests')
      .select('status')
      .eq('id', withdrawal_id)
      .single()
      
    if (withdrawalError) {
      console.error('Error fetching withdrawal:', withdrawalError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch withdrawal details' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Add a database notification
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: user_id,
        type: 'withdrawal',
        title: 'Mise à jour de retrait',
        message: `Votre retrait de ${amount}€ a été traité. Nouveau solde: ${new_balance}€`,
        seen: false,
        data: { withdrawal_id, amount, new_balance, status: withdrawal.status }
      })
    
    if (notificationError) {
      console.error('Error creating notification:', notificationError)
      // Continue even if notification creation fails
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Withdrawal notification sent successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Unexpected error in send-withdrawal-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
