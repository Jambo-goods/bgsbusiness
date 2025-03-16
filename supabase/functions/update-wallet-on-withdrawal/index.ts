
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
    console.log('Update wallet on withdrawal function called')
    
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the request body
    const { withdrawal_id } = await req.json()
    
    console.log('Processing withdrawal_id:', withdrawal_id)
    
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
    
    console.log('Withdrawal found:', withdrawal)
    
    // Only proceed if the status is one that should affect the balance
    if (!['approved', 'completed', 'scheduled'].includes(withdrawal.status)) {
      console.log(`No balance update needed: withdrawal status is ${withdrawal.status}`)
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
    const currentBalance = profile.wallet_balance || 0;
    const newBalance = currentBalance - withdrawal.amount;
    console.log(`Updating balance for user ${withdrawal.user_id}: ${currentBalance} - ${withdrawal.amount} = ${newBalance}`)
    
    // Update the user's wallet balance
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', withdrawal.user_id)
      
    if (updateError) {
      console.error('Error updating wallet balance:', updateError)
      return handleError({ message: 'Failed to update wallet balance' }, 500)
    }
    
    console.log('Wallet balance updated successfully, now creating transaction record')
    
    // Create wallet transaction record if it doesn't exist yet
    const { data: existingTransaction } = await supabaseClient
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', withdrawal.user_id)
      .eq('type', 'withdrawal')
      .eq('amount', withdrawal.amount)
      .eq('status', 'completed')
      .eq('description', `Retrait ${withdrawal.status}`)
      .order('created_at', { ascending: false })
      .limit(1)
      
    if (!existingTransaction || existingTransaction.length === 0) {
      console.log('No existing transaction found, creating new one')
      const { error: transactionError } = await supabaseClient
        .from('wallet_transactions')
        .insert({
          user_id: withdrawal.user_id,
          amount: withdrawal.amount,
          type: 'withdrawal',
          status: 'completed',
          description: `Retrait ${withdrawal.status}`
        })
        
      if (transactionError) {
        console.error('Error creating transaction record:', transactionError)
        // Continue even if transaction creation fails
      } else {
        console.log('Transaction record created successfully')
      }
    } else {
      console.log('Existing transaction found, skipping creation')
    }
    
    return handleSuccess({ 
      message: 'Wallet balance updated successfully',
      withdrawal_id: withdrawal.id,
      user_id: withdrawal.user_id,
      amount: withdrawal.amount,
      new_balance: newBalance
    })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return handleError(error)
  }
})
