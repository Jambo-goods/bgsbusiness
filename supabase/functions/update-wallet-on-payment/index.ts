
// Follow Deno's ES module convention
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { handleCors } from "./utils.ts"
import { 
  fetchPayments, 
  fetchProject, 
  fetchInvestments,
  markPaymentAsProcessed 
} from "./database.ts"
import { processInvestorYields } from "./processors.ts"
import { validateRequest } from "./validators.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    // Get the request payload and validate it
    const payload = await req.json();
    console.log(`Processing request with payload:`, payload);
    
    const { isValid, error, validatedData } = validateRequest(payload);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error }),
        { headers: { ...handleCors().headers, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const { paymentId, projectId, percentage, processAll, forceRefresh } = validatedData;

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get payments that need processing
    const { payments, error: paymentsError } = await fetchPayments(supabase, paymentId, projectId, processAll, forceRefresh);
    
    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      throw paymentsError;
    }
    
    console.log(`Found ${payments?.length || 0} payments to process`);
    
    if (!payments || payments.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No payments to process" }),
        { headers: { ...handleCors().headers, "Content-Type": "application/json" } }
      );
    }
    
    let processedCount = 0;
    let paymentIds = [];
    
    // Process each payment
    for (const payment of payments) {
      try {
        console.log(`Processing payment ID: ${payment.id}`);
        paymentIds.push(payment.id);
        
        // Get the project details
        const { project, error: projectError } = await fetchProject(supabase, payment.project_id);
        
        if (projectError) {
          console.error(`Error fetching project ${payment.project_id}:`, projectError);
          continue;
        }
        
        // Get all investments for this project
        const { investments, error: investmentsError } = await fetchInvestments(supabase, payment.project_id);
        
        if (investmentsError) {
          console.error(`Error fetching investments for project ${payment.project_id}:`, investmentsError);
          continue;
        }
        
        if (!investments || investments.length === 0) {
          console.log(`No investments found for project ${payment.project_id}`);
          continue;
        }
        
        console.log(`Found ${investments.length} investments for project ${payment.project_id}`);
        
        // Process investors' yields
        const localProcessedCount = await processInvestorYields(
          supabase,
          investments,
          project,
          payment,
          percentage || payment.percentage,
          forceRefresh
        );
        
        processedCount += localProcessedCount;
        
        // Mark the payment as processed
        await markPaymentAsProcessed(supabase, payment.id, localProcessedCount, investments, project, payment.percentage);
        
      } catch (err) {
        console.error(`Error processing payment ${payment.id}:`, err);
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        payments: payments.length,
        payment_ids: paymentIds,
        message: `Processed ${processedCount} yield transactions for ${payments.length} payments`
      }),
      { headers: { ...handleCors().headers, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { headers: { ...handleCors().headers, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
