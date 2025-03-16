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
    processed_at: string | null
    notes?: string
  }
  old_record: {
    status: string
    processed_at: string | null
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
    console.log("Received webhook payload:", JSON.stringify(payload, null, 2))

    // Only process withdrawal_requests table events
    if (payload.table !== 'withdrawal_requests') {
      return new Response(JSON.stringify({ message: 'Ignored: Not withdrawal_requests table' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Check if processed_at was just filled (changed from null to a value)
    if (payload.record.processed_at && !payload.old_record.processed_at) {
      console.log('Processing withdrawal request that was just processed:', payload.record)
      
      const userId = payload.record.user_id
      const amount = payload.record.amount
      const status = payload.record.status
      const reason = payload.record.notes
      
      try {
        // Create notification via the Edge Function
        const notificationResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-withdrawal-notification`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              amount,
              status,
              reason,
              processed: true
            }),
          }
        )
        
        if (!notificationResponse.ok) {
          const errorData = await notificationResponse.json()
          console.error("Error sending notification via Edge Function:", errorData)
        } else {
          console.log(`Processing notification sent to user ${userId} for amount ${amount}€`)
        }
        
        // Make two attempts to send the confirmation notification
        for (let i = 0; i < 2; i++) {
          // Also send a confirmation notification
          const confirmationResponse = await fetch(
            `${supabaseUrl}/functions/v1/send-withdrawal-notification`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${supabaseServiceRoleKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId,
                amount,
                status: 'confirmed'
              }),
            }
          )
          
          if (!confirmationResponse.ok) {
            const errorData = await confirmationResponse.json()
            console.error(`Error sending confirmation notification via Edge Function (attempt ${i+1}):`, errorData)
          } else {
            console.log(`Confirmation notification sent to user ${userId} for amount ${amount}€ (attempt ${i+1})`)
          }
          
          // Wait a bit before sending the second attempt
          if (i === 0) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }

        // Try direct DB insert for confirmation notification as a fallback
        try {
          const { error: notifError } = await supabaseAdmin
            .from('notifications')
            .insert({
              user_id: userId,
              title: 'Demande de retrait confirmée',
              message: `Votre demande de retrait de ${amount}€ a été confirmée et est en cours de traitement.`,
              type: 'withdrawal',
              seen: false,
              data: { amount, status: 'confirmed', category: 'success' }
            })
            
          if (notifError) {
            console.error("Error with direct DB notification insert:", notifError)
          } else {
            console.log("Direct confirmation notification inserted successfully")
          }
        } catch (directError) {
          console.error("Exception during direct notification insert:", directError)
        }
        
      } catch (notifError) {
        console.error("Error creating processing notification:", notifError)
      }
    }
    
    // Check if the status changed to "scheduled" - cover both possible spellings
    const isScheduled = status => status === 'scheduled' || status === 'sheduled'
    const oldStatus = payload.old_record.status
    const newStatus = payload.record.status
    
    if (isScheduled(newStatus) && !isScheduled(oldStatus)) {
      const userId = payload.record.user_id
      const amount = payload.record.amount
      
      try {
        // Update the user's wallet balance directly
        const { data: balanceData, error: balanceError } = await supabaseAdmin
          .from('profiles')
          .select('wallet_balance')
          .eq('id', userId)
          .single()
        
        if (balanceError) throw balanceError
        
        // Ensure the user has enough balance
        if (balanceData.wallet_balance < amount) {
          // Reject the withdrawal request due to insufficient funds
          await supabaseAdmin
            .from('withdrawal_requests')
            .update({
              status: 'rejected',
              notes: 'Solde insuffisant'
            })
            .eq('id', payload.record.id)
          
          // Send rejection notification
          try {
            await supabaseAdmin
              .from('notifications')
              .insert({
                user_id: userId,
                title: 'Retrait refusé',
                message: `Votre demande de retrait de ${amount}€ a été refusée. Raison: solde insuffisant.`,
                type: 'withdrawal',
                seen: false,
                data: { amount, status: 'rejected', category: 'error', reason: 'Solde insuffisant' }
              })
          } catch (notifError) {
            console.error("Error sending rejection notification:", notifError)
          }
          
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Insufficient balance for withdrawal'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          )
        }
        
        // Perform the balance decrement
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            wallet_balance: balanceData.wallet_balance - amount
          })
          .eq('id', userId)
        
        if (updateError) throw updateError
        
        // Create wallet transaction record
        const { error: transactionError } = await supabaseAdmin
          .from('wallet_transactions')
          .insert({
            user_id: userId,
            amount: amount,
            type: 'withdrawal',
            description: 'Retrait programmé',
            status: 'completed',
          })
        
        if (transactionError) throw transactionError
        
        // Send notification for balance deduction
        try {
          const balanceDeductionResponse = await fetch(
            `${supabaseUrl}/functions/v1/send-withdrawal-notification`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${supabaseServiceRoleKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId,
                amount,
                status: 'balance_deducted',
              }),
            }
          )
          
          if (!balanceDeductionResponse.ok) {
            const errorData = await balanceDeductionResponse.json()
            console.error("Error sending balance deduction notification via Edge Function:", errorData)
          } else {
            console.log(`Balance deduction notification sent to user ${userId} for amount ${amount}€`)
          }
        } catch (notifError) {
          console.error("Error sending balance deduction notification:", notifError)
        }
        
        // Send notification to user for scheduled withdrawal
        const { error: notificationError } = await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Retrait programmé',
            message: `Votre retrait de ${amount}€ a été programmé.`,
            type: 'withdrawal',
            seen: false,
            data: { amount, status: 'scheduled', category: 'info' }
          })
        
        if (notificationError) {
          console.error("Error sending notification:", notificationError)
        }
        
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
      } catch (innerError) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: innerError.message 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }
    }
    
    // Handle "received" status change specifically
    if (newStatus === 'received' && oldStatus !== 'received') {
      const userId = payload.record.user_id
      const amount = payload.record.amount
      
      try {
        // Send notification via the Edge Function
        const receivedResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-withdrawal-notification`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              amount,
              status: 'received'
            }),
          }
        )
        
        if (!receivedResponse.ok) {
          const errorData = await receivedResponse.json()
          console.error("Error sending received notification via Edge Function:", errorData)
        } else {
          console.log(`Received status notification sent to user ${userId} for amount ${amount}€`)
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Received status notification sent successfully',
            user_id: userId,
            amount: amount
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } catch (notifError) {
        console.error("Error sending received notification:", notifError)
      }
    }
    
    // Handle "paid" status change specifically
    if (newStatus === 'paid' && oldStatus !== 'paid') {
      const userId = payload.record.user_id
      const amount = payload.record.amount
      
      try {
        // Send notification via the Edge Function
        const paidResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-withdrawal-notification`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              amount,
              status: 'paid'
            }),
          }
        )
        
        if (!paidResponse.ok) {
          const errorData = await paidResponse.json()
          console.error("Error sending paid notification via Edge Function:", errorData)
        } else {
          console.log(`Paid status notification sent to user ${userId} for amount ${amount}€`)
        }
        
        // Also send a direct DB notification as backup
        try {
          const { error: notifError } = await supabaseAdmin
            .from('notifications')
            .insert({
              user_id: userId,
              title: 'Retrait payé',
              message: `Votre retrait de ${amount}€ a été payé et le montant a été transféré sur votre compte bancaire.`,
              type: 'withdrawal',
              seen: false,
              data: { amount, status: 'paid', category: 'success' }
            })
            
          if (notifError) {
            console.error("Error with direct DB notification insert for paid status:", notifError)
          } else {
            console.log("Direct paid notification inserted successfully")
          }
        } catch (directError) {
          console.error("Exception during direct paid notification insert:", directError)
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Paid status notification sent successfully',
            user_id: userId,
            amount: amount
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } catch (notifError) {
        console.error("Error sending paid notification:", notifError)
      }
    }
    
    // Handle other status changes like completed or rejected
    if (newStatus !== oldStatus) {
      const userId = payload.record.user_id
      const amount = payload.record.amount
      const reason = payload.record.notes
      
      try {
        // Send notification via the Edge Function for any status change
        const notificationResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-withdrawal-notification`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              amount,
              status: newStatus,
              reason
            }),
          }
        )
        
        if (!notificationResponse.ok) {
          const errorData = await notificationResponse.json()
          console.error("Error sending status change notification via Edge Function:", errorData)
        } else {
          console.log(`Status change notification sent to user ${userId} for withdrawal status: ${newStatus}`)
        }
      } catch (notifError) {
        console.error("Error processing status change notification:", notifError)
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Status change processed successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error in handle-withdrawal-status:", error)
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
