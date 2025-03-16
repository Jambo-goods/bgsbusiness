
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/getting_started/server_side
// @deno-types="npm:@types/express"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.34.0'

Deno.serve(async (req) => {
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
    const { userId, amount, status, type = "withdrawal" } = await req.json()
    
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
    
    let title
    let description
    let category
    
    if (status === 'submitted') {
      title = 'Demande de retrait soumise'
      description = `Votre demande de retrait de ${amount}€ a été soumise et est en cours de traitement.`
      category = 'info'
    } else if (status === 'scheduled') {
      title = 'Retrait programmé'
      description = `Votre retrait de ${amount}€ a été programmé et sera traité prochainement.`
      category = 'success'
    } else if (status === 'completed') {
      title = 'Retrait effectué'
      description = `Votre retrait de ${amount}€ a été traité avec succès et les fonds ont été envoyés sur votre compte bancaire.`
      category = 'success'
    } else if (status === 'rejected') {
      title = 'Retrait refusé'
      description = `Votre demande de retrait de ${amount}€ a été refusée. Veuillez contacter le support pour plus d'informations.`
      category = 'error'
    } else {
      title = 'Mise à jour du retrait'
      description = `Le statut de votre retrait de ${amount}€ a été mis à jour: ${status}.`
      category = 'info'
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        description,
        type,
        category,
        read: false
      })
    
    if (error) {
      console.error('Error creating notification:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create notification' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Withdrawal notification sent' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
