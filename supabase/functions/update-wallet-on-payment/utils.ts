
// Utility functions for the edge function

// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS headers
export function handleCors() {
  return new Response(null, { headers: corsHeaders });
}

// Calculate yield amount for an investment
export function calculateYieldAmount(investmentAmount: number, monthlyYieldRate: number, paymentPercentage: number): number {
  return Math.round(investmentAmount * monthlyYieldRate * paymentPercentage / 100);
}

// Format a monetary amount for display
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}
