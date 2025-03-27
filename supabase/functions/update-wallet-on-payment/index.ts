
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the request body
    const { paymentId, projectId, percentage, processAll, forceRefresh } = await req.json()
    
    console.log(`Request data received: ${JSON.stringify({ paymentId, projectId, percentage, processAll, forceRefresh })}`)

    if (!paymentId || !projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get payment details
    const { data: paymentData, error: paymentError } = await supabaseClient
      .from('scheduled_payments')
      .select('*')
      .eq('id', paymentId)
      .single()
      
    if (paymentError) {
      console.error(`Error fetching payment data: ${paymentError.message}`)
      return new Response(
        JSON.stringify({ error: paymentError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // If payment already processed and no force refresh, return early
    if (paymentData.processed_at && !forceRefresh) {
      console.log(`Payment ${paymentId} already processed at ${paymentData.processed_at}, skipping`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment already processed', 
          processed: 0,
          errors: 0,
          alreadyProcessed: true,
          paymentData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch project data to have the project name for better logging
    const { data: projectData, error: projectError } = await supabaseClient
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error(`Error fetching project data: ${projectError.message}`)
    }

    const projectName = projectData?.name || projectId

    console.log(`Processing payment ${paymentId} for project ${projectId} (${projectName})`)

    // Find all investors who have invested in this project
    const { data: investments, error: investmentError } = await supabaseClient
      .from('investments')
      .select('user_id, amount')
      .eq('project_id', projectId)
      .eq('status', 'active')

    if (investmentError) {
      console.error(`Error fetching investments: ${investmentError.message}`)
      return new Response(
        JSON.stringify({ error: investmentError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log(`Found ${investments.length} investors with active investments`)

    // Determine the payment percentage
    console.log(`Payment percentage: ${percentage}%`)

    // Process payments for all investors
    const results = []
    const errors = []

    // Track success and errors
    let successCount = 0
    let errorCount = 0
    let totalYieldAmount = 0

    // Loop through all investors and create wallet transactions
    for (const investment of investments) {
      const userId = investment.user_id
      const investmentAmount = investment.amount
      const yieldAmount = Math.round(investmentAmount * (percentage / 100))

      console.log(`Processing investor ${userId}: ${percentage}% of ${investmentAmount} = ${yieldAmount}`)

      try {
        // FIXED: Use 'deposit' instead of 'yield' since that's what the schema expects
        const { data: txData, error: txError } = await supabaseClient
          .from('wallet_transactions')
          .insert({
            user_id: userId,
            amount: yieldAmount,
            type: 'deposit',  // Changed from 'yield' to 'deposit' to match schema constraint
            status: 'completed',
            description: `Rendement ${percentage}% du projet ${projectName}`
          })

        if (txError) {
          console.error(`Error creating wallet transaction for user ${userId}: ${txError.message}`)
          errors.push({ userId, error: txError.message })
          errorCount++
          continue
        }

        // Update wallet balance directly
        const { error: updateError } = await supabaseClient
          .rpc('increment_wallet_balance', {
            user_id: userId,
            increment_amount: yieldAmount
          })

        if (updateError) {
          console.error(`Error updating wallet balance for user ${userId}: ${updateError.message}`)
          
          // Try a direct update as a fallback
          const { data: profileData, error: profileError } = await supabaseClient
            .from('profiles')
            .select('wallet_balance')
            .eq('id', userId)
            .single()
            
          if (profileError) {
            console.error(`Error fetching profile for user ${userId}: ${profileError.message}`)
            errors.push({ userId, error: profileError.message })
            errorCount++
            continue
          }
          
          const currentBalance = profileData?.wallet_balance || 0
          const newBalance = currentBalance + yieldAmount
          
          const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({ wallet_balance: newBalance })
            .eq('id', userId)
            
          if (updateError) {
            console.error(`Error with direct wallet update for user ${userId}: ${updateError.message}`)
            errors.push({ userId, error: updateError.message })
            errorCount++
            continue
          } else {
            console.log(`Direct wallet update successful for user ${userId}: ${currentBalance} + ${yieldAmount} = ${newBalance}`)
          }
        } else {
          console.log(`Successfully updated wallet balance for user ${userId} by adding ${yieldAmount}`)
        }

        // Create notification for the user
        const { error: notifError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Rendement reçu',
            message: `Vous avez reçu un rendement de ${yieldAmount}€ pour le projet ${projectName}`,
            type: 'yield',
            seen: false,
            data: {
              amount: yieldAmount,
              category: 'success'
            }
          })

        if (notifError) {
          console.error(`Error creating notification for user ${userId}: ${notifError.message}`)
          // Don't fail the process if notification creation fails
        }

        results.push({ userId, amount: yieldAmount, status: 'success' })
        successCount++
        totalYieldAmount += yieldAmount
      } catch (error) {
        console.error(`Exception processing user ${userId}: ${error.message || error}`)
        errors.push({ userId, error: error.message || 'Unknown error' })
        errorCount++
      }
    }

    // Update the payment record to mark it as processed
    const { error: updateError } = await supabaseClient
      .from('scheduled_payments')
      .update({
        processed_at: new Date().toISOString(),
        status: 'paid'
      })
      .eq('id', paymentId)

    if (updateError) {
      console.error(`Error updating payment record: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Payment processing completed for ${successCount} investors with ${errorCount} errors`,
        processed: successCount,
        errors: errorCount,
        totalAmount: totalYieldAmount,
        results,
        errorDetails: errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error(`Unhandled error: ${error.message || error}`)
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
