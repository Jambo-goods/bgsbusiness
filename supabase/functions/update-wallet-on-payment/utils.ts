
// Follow Deno's ES module convention
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
export const handleCors = () => {
  return new Response(null, {
    headers: corsHeaders,
    status: 204,
  })
}

// Validate the incoming request payload
export const validateRequest = (payload: any) => {
  // Check if all required fields are present
  if (!payload) {
    return { 
      isValid: false, 
      error: "Missing request body" 
    };
  }
  
  // Default percentage to 100% if not specified
  if (!payload.percentage && payload.percentage !== 0) {
    payload.percentage = 100;
  }
  
  // Need at least a payment ID or a project ID
  if (!payload.paymentId && !payload.projectId) {
    return { 
      isValid: false, 
      error: "Either paymentId or projectId is required" 
    };
  }
  
  // Return the validated data
  return {
    isValid: true,
    validatedData: {
      paymentId: payload.paymentId,
      projectId: payload.projectId,
      percentage: payload.percentage,
      processAll: payload.processAll === true,
      forceRefresh: payload.forceRefresh === true
    }
  };
}

// Calculate yield amount based on investment, rate, and payment percentage
export const calculateYieldAmount = (
  investmentAmount: number,
  monthlyYieldRate: number, 
  paymentPercentage: number
): number => {
  // Calculate the monthly yield amount
  // investmentAmount is the principal amount invested
  // monthlyYieldRate is the monthly rate (yearly rate / 12)
  // paymentPercentage is what percentage of this month's yield to distribute
  
  if (!investmentAmount || investmentAmount <= 0) return 0;
  if (!monthlyYieldRate || monthlyYieldRate <= 0) return 0;
  if (!paymentPercentage || paymentPercentage <= 0) return 0;
  
  // Calculate: investment * monthly rate * payment percentage
  // We use Math.floor to avoid rounding errors that might lead to overcrediting
  // The result is rounded down to the nearest whole number (assuming currency)
  return Math.floor((investmentAmount * monthlyYieldRate) * (paymentPercentage / 100));
}
