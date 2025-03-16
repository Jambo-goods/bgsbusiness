
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
    const { user_id, amount, new_balance, withdrawal_id, userName, userEmail, bankDetails } = await req.json()
    
    console.log('Processing notification for user:', user_id, 'withdrawal:', withdrawal_id)
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the withdrawal request details if withdrawal_id is provided
    let withdrawal = null;
    if (withdrawal_id) {
      const { data, error } = await supabaseClient
        .from('withdrawal_requests')
        .select('status, amount')
        .eq('id', withdrawal_id)
        .single()
        
      if (error) {
        console.error('Error fetching withdrawal:', error)
      } else {
        withdrawal = data;
      }
    }
    
    // Create different notification message based on available data
    let notificationTitle = 'Mise à jour de retrait';
    let notificationMessage = '';
    
    // Fix typo in status check (sheduled -> scheduled)
    if (withdrawal && withdrawal.status === 'pending') {
      notificationMessage = `Votre demande de retrait de ${amount || withdrawal.amount}€ a été reçue et est en cours de traitement.`;
    } else if (new_balance !== undefined) {
      notificationMessage = `Votre retrait de ${amount}€ a été traité. Nouveau solde: ${new_balance}€`;
    } else if (amount) {
      notificationMessage = `Votre retrait de ${amount}€ est en cours de traitement.`;
    } else {
      notificationMessage = `Votre demande de retrait a été mise à jour.`;
    }
    
    // Add a database notification
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: user_id,
        type: 'withdrawal',
        title: notificationTitle,
        message: notificationMessage,
        seen: false,
        data: { 
          withdrawal_id, 
          amount, 
          new_balance,
          status: withdrawal?.status || 'processing',
          bankDetails
        }
      })
    
    if (notificationError) {
      console.error('Error creating notification:', notificationError)
      // Continue even if notification creation fails
    }
    
    // If this is a completed withdrawal (with new_balance), trigger wallet balance recalculation
    if (new_balance !== undefined && withdrawal_id) {
      try {
        // First try the more precise function if we have a withdrawal ID
        await supabaseClient.functions.invoke('update-wallet-on-withdrawal', {
          body: { withdrawal_id }
        });
        console.log('Withdrawal processed through update-wallet-on-withdrawal function');
      } catch (withdrawalError) {
        console.error('Error calling withdrawal update function:', withdrawalError);
        
        // Fallback to general recalculation
        try {
          await supabaseClient.rpc('recalculate_wallet_balance', { 
            user_uuid: user_id 
          });
          console.log('Wallet balance recalculated after failed withdrawal processing');
        } catch (recalcError) {
          console.error('Error recalculating wallet balance:', recalcError);
        }
      }
    }
    
    // If this is a new withdrawal request with bank details, notify admins
    if (bankDetails && userName && withdrawal_id && withdrawal?.status === 'pending') {
      try {
        await supabaseClient.functions.invoke('send-admin-notification', {
          body: {
            type: 'withdrawal_request',
            title: 'Nouvelle demande de retrait',
            message: `${userName} (${userEmail}) a demandé un retrait de ${amount}€`,
            data: {
              user_id,
              withdrawal_id,
              amount,
              bankDetails
            }
          }
        });
        console.log('Admin notification sent for withdrawal request');
      } catch (adminNotifError) {
        console.error('Error sending admin notification:', adminNotifError);
      }
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
