
// update-wallet-on-withdrawal/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders, handleError, handleOptionsRequest, handleSuccess } from '../_shared/utils.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest()
  }
  
  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the request body
    const { withdrawal_id } = await req.json()
    
    if (!withdrawal_id) {
      return handleError({ message: 'Withdrawal ID is required' }, 400)
    }

    // Get the withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabaseClient
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawal_id)
      .single()
      
    if (withdrawalError || !withdrawal) {
      console.error('Error fetching withdrawal:', withdrawalError)
      return handleError({ message: 'Failed to fetch withdrawal request' }, 404)
    }
    
    // Only proceed if the status is one that should affect the balance
    if (!['approved', 'completed', 'scheduled'].includes(withdrawal.status)) {
      return handleSuccess({ 
        message: `No balance update needed: withdrawal status is ${withdrawal.status}` 
      })
    }
    
    // Get the current user balance
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('wallet_balance')
      .eq('id', withdrawal.user_id)
      .single()
      
    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return handleError({ message: 'Failed to fetch user profile' }, 404)
    }
    
    // Calculate the new balance
    const newBalance = (profile.wallet_balance || 0) - withdrawal.amount
    console.log(`Updating balance for user ${withdrawal.user_id}: ${profile.wallet_balance} - ${withdrawal.amount} = ${newBalance}`)
    
    // Update the user's wallet balance
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', withdrawal.user_id)
      
    if (updateError) {
      console.error('Error updating wallet balance:', updateError)
      return handleError({ message: 'Failed to update wallet balance' }, 500)
    }
    
    return handleSuccess({ 
      message: 'Wallet balance updated successfully',
      withdrawal_id: withdrawal.id,
      user_id: withdrawal.user_id,
      amount: withdrawal.amount,
      new_balance: newBalance
    })
    
  } catch (error) {
    return handleError(error)
  }
})
