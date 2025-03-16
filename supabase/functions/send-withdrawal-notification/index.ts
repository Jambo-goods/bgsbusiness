
// Create a new Edge Function file to handle withdrawal notifications
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  userId: string
  amount: number
  status: string
  reason?: string
  processed?: boolean
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    const payload: NotificationPayload = await req.json()
    const { userId, amount, status, reason, processed } = payload

    console.log(`Processing withdrawal notification for user ${userId}, status: ${status}, amount: ${amount}`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables for Supabase connection')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { 
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Determine notification details based on status
    let title = ''
    let message = ''
    let category: 'info' | 'success' | 'warning' | 'error' = 'info' 

    switch (status) {
      case 'received':
        title = 'Demande de retrait reçue'
        message = `Votre demande de retrait de ${amount}€ a bien été reçue et est en cours d'examen.`
        category = 'info'
        break
      case 'processing':
      case 'processed':
        title = 'Demande de retrait en traitement'
        message = `Votre demande de retrait de ${amount}€ est en cours de traitement.`
        category = 'info'
        break
      case 'confirmed':
        title = 'Demande de retrait confirmée'
        message = `Votre demande de retrait de ${amount}€ a été confirmée et est en cours de traitement.`
        category = 'success'
        break
      case 'validated':
      case 'approved':
        title = 'Retrait validé'
        message = `Votre demande de retrait de ${amount}€ a été validée et sera traitée prochainement.`
        category = 'success'
        break
      case 'scheduled':
      case 'sheduled': // handle misspelling
        title = 'Retrait programmé'
        message = `Votre retrait de ${amount}€ a été programmé et sera envoyé sur votre compte.`
        category = 'success'
        break
      case 'completed':
        title = 'Retrait effectué'
        message = `Votre retrait de ${amount}€ a été effectué avec succès.`
        category = 'success'
        break
      case 'rejected':
        title = 'Retrait refusé'
        message = `Votre demande de retrait de ${amount}€ a été refusée.${reason ? ` Raison: ${reason}` : ''}`
        category = 'error'
        break
      case 'balance_deducted':
        title = 'Montant débité'
        message = `Le montant de ${amount}€ a été débité de votre solde pour votre demande de retrait.`
        category = 'info'
        break
      case 'paid':
        title = 'Retrait payé'
        message = `Votre retrait de ${amount}€ a été payé et le montant a été transféré sur votre compte bancaire.`
        category = 'success'
        break
      default:
        title = 'Mise à jour du retrait'
        message = `Le statut de votre retrait de ${amount}€ a été mis à jour: ${status}.`
        category = 'info'
    }

    // Create the notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type: 'withdrawal',
        seen: false,
        data: { 
          amount, 
          status, 
          category,
          reason,
          processed
        }
      })

    if (error) {
      throw error
    }

    console.log(`Successfully created ${status} notification for user ${userId}`)

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing withdrawal notification:', error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
