
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
        // Check if a transaction already exists for this payment and user
        try {
          const { data: existingTx, error: existingTxError } = await supabaseClient
            .from('wallet_transactions')
            .select('id')
            .eq('user_id', userId)
            .eq('payment_id', paymentId)
            .eq('type', 'yield')
            .maybeSingle()

          if (existingTxError) {
            console.error(`Error checking existing transaction for user ${userId}: ${existingTxError}`)
          }

          // If transaction already exists and we're not forcing a refresh, skip
          if (existingTx && !forceRefresh) {
            console.log(`Transaction already exists for user ${userId} and payment ${paymentId}, skipping`)
            continue
          } else if (existingTx && forceRefresh) {
            console.log(`Transaction exists but force refresh requested, updating for user ${userId}`)
          }
        } catch (checkError) {
          // If there's an error checking existing transactions, log it but continue
          console.error(`Error checking existing transaction: ${checkError}`)
        }

        // Create wallet transaction
        const { data: txData, error: txError } = await supabaseClient
          .from('wallet_transactions')
          .upsert({
            user_id: userId,
            amount: yieldAmount,
            type: 'yield',
            status: 'completed',
            description: `Rendement ${percentage}% du projet ${projectName}`,
            payment_id: paymentId,
            project_id: projectId,
            created_at: new Date().toISOString()
          })
          .select()
          .maybeSingle()

        if (txError) {
          console.error(`Error creating wallet transaction for user ${userId}: ${txError.message}`)
          errors.push({ userId, error: txError.message })
          errorCount++
          continue
        }

        // Update wallet balance directly
        const { data: userData, error: userError } = await supabaseClient
          .rpc('increment_wallet_balance', {
            user_id: userId,
            increment_amount: yieldAmount
          })

        if (userError) {
          console.error(`Error updating wallet balance for user ${userId}: ${userError.message}`)
          
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
              project_id: projectId,
              payment_id: paymentId,
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
        console.error(`Exception processing user ${userId}: ${error.message}`)
        errors.push({ userId, error: error.message })
        errorCount++
      }
    }

    // Update the payment record to add processed information
    const { error: updateError } = await supabaseClient
      .from('scheduled_payments')
      .update({
        processed_at: new Date().toISOString(),
        processed_investors_count: successCount,
        processed_amount: totalYieldAmount
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
    console.error(`Unhandled error: ${error.message}`)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

/* To invoke:
curl -i --location --request POST 'http://localhost:54321/functions/v1/update-wallet-on-payment' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{"paymentId":"123e4567-e89b-12d3-a456-426614174000","projectId":"123e4567-e89b-12d3-a456-426614174000","percentage":10,"processAll":true}'
*/
