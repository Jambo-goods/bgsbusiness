
// Follow Deno's ES module convention
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { handleCors, corsHeaders } from "./utils.ts"
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
    let payload;
    try {
      payload = await req.json();
      console.log(`Processing request with payload:`, payload);
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const { isValid, error, validatedData } = validateRequest(payload);
    if (!isValid) {
      console.error("Invalid request data:", error);
      return new Response(
        JSON.stringify({ error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const { paymentId, projectId, percentage, processAll, forceRefresh } = validatedData;

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get payments that need processing
    const { payments, error: paymentsError } = await fetchPayments(supabase, paymentId, projectId, processAll, forceRefresh);
    
    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return new Response(
        JSON.stringify({ error: paymentsError.message || "Error fetching payments" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    console.log(`Found ${payments?.length || 0} payments to process`);
    
    if (!payments || payments.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No payments to process" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    let processedCount = 0;
    let paymentIds = [];
    let errors = [];
    
    // Process each payment
    for (const payment of payments) {
      try {
        console.log(`Processing payment ID: ${payment.id}`);
        paymentIds.push(payment.id);
        
        // Get the project details
        const { project, error: projectError } = await fetchProject(supabase, payment.project_id);
        
        if (projectError) {
          console.error(`Error fetching project ${payment.project_id}:`, projectError);
          errors.push({
            payment_id: payment.id,
            error: `Error fetching project: ${projectError.message}`
          });
          continue;
        }
        
        if (!project) {
          console.error(`Project ${payment.project_id} not found`);
          errors.push({
            payment_id: payment.id,
            error: `Project not found for ID: ${payment.project_id}`
          });
          continue;
        }
        
        // Get all investments for this project
        const { investments, error: investmentsError } = await fetchInvestments(supabase, payment.project_id);
        
        if (investmentsError) {
          console.error(`Error fetching investments for project ${payment.project_id}:`, investmentsError);
          errors.push({
            payment_id: payment.id,
            error: `Error fetching investments: ${investmentsError.message}`
          });
          continue;
        }
        
        // Check if there are any active investments
        const activeInvestments = investments?.filter(inv => inv.status === 'active') || [];
        console.log(`Found ${activeInvestments.length} active investments out of ${investments?.length || 0} total investments`);
        
        // If there are no active investments, mark the payment as processed but with a note
        if (!activeInvestments || activeInvestments.length === 0) {
          console.log(`No active investments found for project ${payment.project_id}, marking as processed with no investors`);
          
          // Mark payment as processed with 0 investors
          await markPaymentAsProcessed(supabase, payment.id, 0, [], project, payment.percentage);
          
          continue;
        }
        
        console.log(`Processing ${activeInvestments.length} active investments for project ${project.name} (${payment.project_id})`);
        
        // Process investors' yields
        const localProcessedCount = await processInvestorYields(
          supabase,
          activeInvestments,
          project,
          payment,
          percentage || payment.percentage,
          forceRefresh
        );
        
        processedCount += localProcessedCount;
        
        // Mark the payment as processed regardless of yield processing results
        await markPaymentAsProcessed(supabase, payment.id, localProcessedCount, activeInvestments, project, payment.percentage);
        
      } catch (err) {
        console.error(`Error processing payment ${payment.id}:`, err);
        errors.push({
          payment_id: payment.id,
          error: err.message || "Unknown error"
        });
      }
    }
    
    const response = {
      success: true,
      processed: processedCount,
      payments: payments.length,
      payment_ids: paymentIds,
      message: processedCount > 0 
        ? `Processed ${processedCount} yield transactions for ${payments.length} payments`
        : "No investors to credit for this payment, but payment marked as processed",
      errors: errors.length > 0 ? errors : undefined
    };
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

