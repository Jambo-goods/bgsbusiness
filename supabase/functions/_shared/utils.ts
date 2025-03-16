
// Helper functions for Supabase Edge Functions

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export function handleError(error: any, status: number = 400) {
  console.error('Error:', error.message || error)
  return new Response(
    JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

export function handleSuccess(data: any, status: number = 200) {
  return new Response(
    JSON.stringify({ success: true, data }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

export function handleOptionsRequest() {
  return new Response(null, { headers: corsHeaders })
}
