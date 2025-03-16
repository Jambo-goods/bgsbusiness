
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/getting_started/server_side
// @deno-types="npm:@types/express"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.34.0'

Deno.serve(async (req) => {
  console.log("send-withdrawal-notification function called")
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }
  
  try {
    const { userId, amount, status, type = "withdrawal", reason = "", processed = false } = await req.json()
    console.log("Received notification request:", { userId, amount, status, type, reason, processed })
    
    if (!userId || !amount || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, amount, status' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    let title, message, category
    
    if (processed) {
      title = 'Demande de retrait traitée'
      message = `Votre demande de retrait de ${amount}€ a été traitée. Statut: ${status}.`
      category = status === 'rejected' ? 'error' : 'success'
    } else if (status === 'submitted') {
      title = 'Demande de retrait soumise'
      message = `Votre demande de retrait de ${amount}€ a été soumise et est en cours de traitement.`
      category = 'info'
    } else if (status === 'validated' || status === 'approved') {
      title = 'Retrait validé'
      message = `Votre demande de retrait de ${amount}€ a été validée et sera traitée prochainement.`
      category = 'success'
    } else if (status === 'scheduled' || status === 'sheduled') {
      title = 'Retrait programmé'
      message = `Votre retrait de ${amount}€ a été programmé et sera traité prochainement.`
      category = 'success'
    } else if (status === 'completed') {
      title = 'Retrait effectué'
      message = `Votre retrait de ${amount}€ a été traité avec succès et les fonds ont été envoyés sur votre compte bancaire.`
      category = 'success'
    } else if (status === 'rejected') {
      title = 'Retrait refusé'
      message = `Votre demande de retrait de ${amount}€ a été refusée.${reason ? ` Raison: ${reason}` : ''}`
      category = 'error'
    } else {
      title = 'Mise à jour du retrait'
      message = `Le statut de votre retrait de ${amount}€ a été mis à jour: ${status}.`
      category = 'info'
    }
    
    console.log("Creating notification:", { title, message, category, status })
    
    // Créer une notification avec les champs correctement formatés
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        seen: false,
        data: { amount, status, category, processed, reason }
      })
    
    if (error) {
      console.error("Error creating notification:", error);
      return new Response(
        JSON.stringify({ error: 'Failed to create notification', details: error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    console.log("Notification created successfully")
    
    return new Response(
      JSON.stringify({ success: true, message: 'Withdrawal notification sent' }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    )
  } catch (error) {
    console.error("Error in send-withdrawal-notification:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    )
  }
})
