
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

    // Only process withdrawal_requests table events
    if (payload.table !== 'withdrawal_requests') {
      return new Response(JSON.stringify({ message: 'Ignored: Not withdrawal_requests table' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
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
        
        // Send notification to user
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
    
    // Handle other status changes like completed or rejected
    if (newStatus !== oldStatus) {
      const userId = payload.record.user_id
      const amount = payload.record.amount
      
      try {
        let notificationData = {
          user_id: userId,
          title: '',
          message: '',
          type: 'withdrawal',
          seen: false,
          data: { amount, status: newStatus, category: 'info' as const }
        }
        
        if (newStatus === 'approved') {
          notificationData.title = 'Retrait approuvé'
          notificationData.message = `Votre retrait de ${amount}€ a été approuvé et sera traité prochainement.`
          notificationData.data.category = 'success'
        } else if (newStatus === 'completed') {
          notificationData.title = 'Retrait effectué'
          notificationData.message = `Votre retrait de ${amount}€ a été traité avec succès et les fonds ont été envoyés sur votre compte bancaire.`
          notificationData.data.category = 'success'
        } else if (newStatus === 'rejected') {
          notificationData.title = 'Retrait refusé'
          notificationData.message = `Votre demande de retrait de ${amount}€ a été refusée.`
          notificationData.data.category = 'error'
        }
        
        // Only send notification if we have a title (meaning we want to send a notification for this status)
        if (notificationData.title) {
          const { error: notificationError } = await supabaseAdmin
            .from('notifications')
            .insert(notificationData)
          
          if (notificationError) {
            console.error("Error sending status change notification:", notificationError)
          }
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
