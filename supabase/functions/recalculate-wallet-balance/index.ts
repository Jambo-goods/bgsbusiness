
// recalculate-wallet-balance/index.ts

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
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the session to identify the user
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
    
    if (sessionError || !session) {
      console.error('Error getting session:', sessionError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const userId = session.user.id
    console.log(`Recalculating wallet balance for user ${userId}`)
    
    // Get deposits (bank transfers with status 'received' or 'reçu')
    const { data: transfers, error: transfersError } = await supabaseClient
      .from('bank_transfers')
      .select('amount')
      .eq('user_id', userId)
      .in('status', ['received', 'reçu'])

    if (transfersError) {
      console.error('Error fetching transfers:', transfersError)
      throw new Error('Failed to fetch transfers')
    }

    // Calculate total deposits
    const totalDeposits = transfers.reduce((sum, t) => sum + (t.amount || 0), 0)
    console.log(`Total deposits: ${totalDeposits}`)

    // Get ALL withdrawals that affect the balance (approved, completed, and scheduled)
    const { data: withdrawals, error: withdrawalsError } = await supabaseClient
      .from('withdrawal_requests')
      .select('amount, status')
      .eq('user_id', userId)
      .in('status', ['approved', 'completed', 'scheduled'])
      
    if (withdrawalsError) {
      console.error('Error fetching withdrawals:', withdrawalsError)
      throw new Error('Failed to fetch withdrawals')
    }
    
    console.log('Withdrawals data:', withdrawals)
    
    // Calculate total withdrawals
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0)
    console.log(`Total withdrawals: ${totalWithdrawals}`)
    
    // Calculate final balance (deposits - withdrawals)
    const calculatedBalance = totalDeposits - totalWithdrawals
    console.log(`Calculated balance: ${calculatedBalance}`)
    
    // Update user's wallet balance
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ wallet_balance: calculatedBalance })
      .eq('id', userId)
      
    if (updateError) {
      console.error('Error updating wallet balance:', updateError)
      throw new Error('Failed to update wallet balance')
    }
    
    // Get the updated wallet balance to return in response
    const { data: updatedProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single()
      
    if (profileError) {
      console.error('Error fetching updated profile:', profileError)
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        balance: updatedProfile?.wallet_balance || calculatedBalance,
        details: {
          deposits: totalDeposits,
          withdrawals: totalWithdrawals
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
