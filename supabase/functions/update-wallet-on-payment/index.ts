
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface PaymentUpdateBody {
  paymentId: string;
  projectId: string;
  percentage: number;
}

serve(async (req) => {
  try {
    // Create a Supabase client with the auth admin role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse the request body
    const { paymentId, projectId, percentage } = await req.json() as PaymentUpdateBody;
    
    console.log(`Processing wallet updates for payment: ${paymentId}, project: ${projectId}, percentage: ${percentage}%`);
    
    if (!paymentId || !projectId || percentage === undefined) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required parameters" 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get all investments for this project
    const { data: investments, error: investmentsError } = await supabaseAdmin
      .from('investments')
      .select('id, user_id, amount, project_id')
      .eq('project_id', projectId);
    
    if (investmentsError) {
      console.error("Error fetching investments:", investmentsError);
      throw investmentsError;
    }
    
    console.log(`Found ${investments?.length || 0} investments for project ${projectId}`);
    
    if (!investments || investments.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No investments found for this project" 
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // For each investment, calculate the investor's portion and create a wallet transaction
    const results = await Promise.all(investments.map(async (investment) => {
      try {
        const userId = investment.user_id;
        const investmentAmount = investment.amount || 0;
        
        // Calculate payment amount based on investment amount and percentage
        const paymentAmount = (investmentAmount * percentage) / 100;
        
        console.log(`Creating transaction for user ${userId}: ${paymentAmount}€ (${percentage}% of ${investmentAmount}€)`);
        
        // Check if a transaction already exists for this payment and user
        const { data: existingTx } = await supabaseAdmin
          .from('wallet_transactions')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'yield')
          .eq('related_payment_id', paymentId)
          .maybeSingle();
          
        if (existingTx) {
          console.log(`Transaction already exists for payment ${paymentId} and user ${userId}`);
          return {
            userId,
            status: 'exists',
            amount: paymentAmount
          };
        }
        
        // Create a wallet transaction
        const { data: transaction, error: txError } = await supabaseAdmin
          .from('wallet_transactions')
          .insert({
            user_id: userId,
            amount: paymentAmount,
            type: 'yield',
            description: `Rendement d'investissement (${percentage}%)`,
            status: 'completed',
            related_payment_id: paymentId,
            related_investment_id: investment.id
          })
          .select()
          .single();
        
        if (txError) {
          console.error(`Error creating transaction for user ${userId}:`, txError);
          throw txError;
        }
        
        console.log(`Transaction created for user ${userId}: ${transaction.id}`);
        
        // Update user's wallet balance
        const { error: balanceError } = await supabaseAdmin.rpc(
          'increment_wallet_balance',
          { user_id: userId, increment_amount: paymentAmount }
        );
        
        if (balanceError) {
          console.error(`Error updating wallet balance for user ${userId}:`, balanceError);
          throw balanceError;
        }
        
        console.log(`Wallet balance updated for user ${userId}: +${paymentAmount}€`);
        
        // Create a notification
        const { error: notificationError } = await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Rendement reçu !',
            message: `Vous avez reçu un rendement de ${paymentAmount.toFixed(2)}€ sur votre investissement.`,
            type: 'yield',
            seen: false,
            data: {
              amount: paymentAmount,
              percentage: percentage,
              investmentId: investment.id,
              projectId: projectId,
              timestamp: new Date().toISOString()
            }
          });
          
        if (notificationError) {
          console.error(`Error creating notification for user ${userId}:`, notificationError);
          // Continue anyway
        } else {
          console.log(`Notification created for user ${userId}`);
        }
        
        return {
          userId,
          status: 'success',
          transactionId: transaction.id,
          amount: paymentAmount
        };
      } catch (error) {
        console.error(`Error processing investment ${investment.id}:`, error);
        return {
          userId: investment.user_id,
          status: 'error',
          error: error.message
        };
      }
    }));
    
    // Mark the payment as processed
    const { error: updateError } = await supabaseAdmin
      .from('scheduled_payments')
      .update({
        processed_at: new Date().toISOString()
      })
      .eq('id', paymentId);
      
    if (updateError) {
      console.error("Error updating payment processed_at:", updateError);
      // Continue anyway
    }
    
    // Return the results
    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} investments`,
        results: results
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing payment:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An error occurred processing the payment"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
