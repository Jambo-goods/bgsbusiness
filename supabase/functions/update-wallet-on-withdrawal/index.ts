
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

    // Check if this withdrawal is in a status that should update the balance
    if (withdrawal.status !== 'approved' && withdrawal.status !== 'completed' && withdrawal.status !== 'scheduled') {
      console.log(`Withdrawal status is ${withdrawal.status}, not updating balance`)
      return handleSuccess({ 
        message: 'No balance update needed for this withdrawal status',
        withdrawal_id: withdrawal.id,
        status: withdrawal.status
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
    
    // Create or update a transaction record to avoid duplicate deductions
    const { data: existingTransaction, error: checkError } = await supabaseClient
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', withdrawal.user_id)
      .eq('type', 'withdrawal')
      .eq('amount', withdrawal.amount)
      .eq('status', 'completed')
      .or(`description.like.%${withdrawal.id}%,description.like.%${withdrawal.status}%`)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (checkError) {
      console.error('Error checking for existing transactions:', checkError);
    }
    
    // If we found an existing transaction for this withdrawal, don't deduct again
    if (existingTransaction && existingTransaction.length > 0) {
      console.log('Transaction already exists for this withdrawal, not deducting again:', existingTransaction[0].id);
      
      // Still update the status to completed if needed
      if (withdrawal.status === 'approved' || withdrawal.status === 'scheduled') {
        const { error: updateError } = await supabaseClient
          .from('withdrawal_requests')
          .update({ status: 'completed' })
          .eq('id', withdrawal.id)
          
        if (updateError) {
          console.error('Error updating withdrawal status:', updateError)
        } else {
          console.log('Withdrawal status updated to completed')
        }
      }
      
      return handleSuccess({ 
        message: 'Wallet balance already updated for this withdrawal',
        withdrawal_id: withdrawal.id,
        user_id: withdrawal.user_id,
        amount: withdrawal.amount,
        new_balance: currentBalance
      });
    }
    
    // Update the user's wallet balance - Use increment_wallet_balance to ensure atomicity
    const { error: rpcError } = await supabaseClient.rpc(
      'increment_wallet_balance',
      { 
        user_id: withdrawal.user_id,
        increment_amount: -withdrawal.amount 
      }
    )
      
    if (rpcError) {
      console.error('Error using increment_wallet_balance RPC:', rpcError)
      
      // Fallback: Update the balance directly if RPC fails
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', withdrawal.user_id)
        
      if (updateError) {
        console.error('Error updating wallet balance (fallback method):', updateError)
        return handleError({ message: 'Failed to update wallet balance' }, 500)
      }
    }
    
    console.log('Wallet balance updated successfully, now creating transaction record')
    
    // Create wallet transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('wallet_transactions')
      .insert({
        user_id: withdrawal.user_id,
        amount: withdrawal.amount,
        type: 'withdrawal',
        status: 'completed',
        description: `Retrait ${withdrawal.amount}€ - ${withdrawal.status} (ID: ${withdrawal.id})`
      })
      .select('id')
      .single()
      
    if (transactionError) {
      console.error('Error creating transaction record:', transactionError)
      // Continue even if transaction creation fails as the balance was already updated
    } else {
      console.log('Transaction record created successfully:', transaction)
    }
    
    // Update withdrawal status to completed if it was approved
    if (withdrawal.status === 'approved' || withdrawal.status === 'scheduled') {
      const { error: updateError } = await supabaseClient
        .from('withdrawal_requests')
        .update({ status: 'completed' })
        .eq('id', withdrawal.id)
        
      if (updateError) {
        console.error('Error updating withdrawal status:', updateError)
        // Continue even if status update fails
      } else {
        console.log('Withdrawal status updated to completed')
      }
    }
    
    // Notify about the balance update
    try {
      const { error: notificationError } = await supabaseClient.functions.invoke('send-withdrawal-notification', {
        body: { 
          user_id: withdrawal.user_id,
          amount: withdrawal.amount,
          new_balance: newBalance,
          withdrawal_id: withdrawal.id 
        }
      })
      
      if (notificationError) {
        console.error('Error sending notification:', notificationError)
      } else {
        console.log('Withdrawal notification sent successfully')
      }
    } catch (notifyError) {
      console.error('Error invoking notification function:', notifyError)
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
