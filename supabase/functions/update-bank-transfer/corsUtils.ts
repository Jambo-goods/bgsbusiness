
// CORS headers setup and utilities

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Utility to create a response with CORS headers
export function createResponse(body: any, status: number = 200) {
  return new Response(
    JSON.stringify(body),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}
