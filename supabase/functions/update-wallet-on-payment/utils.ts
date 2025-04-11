
// Utility functions for payment processing
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Calculate yield amount based on investment, rate, and percentage
export function calculateYieldAmount(investmentAmount: number, monthlyYieldRate: number, percentage: number): number {
  if (!investmentAmount || !monthlyYieldRate || !percentage) {
    return 0;
  }
  
  const amount = Math.round(investmentAmount * monthlyYieldRate * percentage / 100);
  return amount > 0 ? amount : 0;
}

// CORS headers for responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Handle CORS preflight requests
export function handleCors() {
  return new Response(null, {
    headers: corsHeaders,
    status: 204,
  });
}
