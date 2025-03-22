import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Create a Supabase client with the Admin key
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    
    // Check the request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
      );
    }
    
    // Parse request body
    const { userId, reference, withdrawalId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: userId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Handle withdrawal if withdrawalId is provided
    if (withdrawalId) {
      return await fixWithdrawal(supabase, userId, withdrawalId, corsHeaders);
    }
    
    // Otherwise handle deposit
    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: reference' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    return await fixDeposit(supabase, userId, reference, corsHeaders);
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function fixWithdrawal(supabase, userId, withdrawalId, corsHeaders) {
  try {
    // Find the withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawalId)
      .eq('user_id', userId)
      .single();
      
    if (withdrawalError) {
      console.error('Error fetching withdrawal:', withdrawalError.message);
      return new Response(
        JSON.stringify({ error: `Error fetching withdrawal: ${withdrawalError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    if (!withdrawal) {
      return new Response(
        JSON.stringify({ error: `No withdrawal found with ID ${withdrawalId}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    console.log('Found withdrawal:', withdrawal);
    
    // Update the withdrawal status to paid
    const { error: updateError } = await supabase
      .from('withdrawal_requests')
      .update({ 
        status: 'paid',
        processed_at: new Date().toISOString()
      })
      .eq('id', withdrawalId);
      
    if (updateError) {
      console.error('Error updating withdrawal:', updateError.message);
      return new Response(
        JSON.stringify({ error: `Error updating withdrawal: ${updateError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Create a notification for the paid withdrawal
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'withdrawal',
        title: 'Retrait payé',
        message: `Votre retrait de ${withdrawal.amount}€ a été payé. Le montant a été transféré sur votre compte bancaire.`,
        seen: false,
        data: {
          amount: withdrawal.amount,
          category: 'success',
          status: 'paid',
          timestamp: new Date().toISOString()
        }
      });
      
    if (notificationError) {
      console.error('Error creating notification:', notificationError.message);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Retrait de ${withdrawal.amount}€ marqué comme payé` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in fixWithdrawal:', error.message);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function fixDeposit(supabase, userId, reference, corsHeaders) {
  console.log(`Fixing deposit for user ${userId} with reference ${reference}`);
  
  // Find the bank transfer by reference
  const { data: transfer, error: transferError } = await supabase
    .from('bank_transfers')
    .select('*')
    .eq('user_id', userId)
    .ilike('reference', `%${reference}%`)
    .maybeSingle();
    
  if (transferError) {
    console.error('Error fetching transfer:', transferError.message);
    return new Response(
      JSON.stringify({ error: `Error fetching transfer: ${transferError.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
  
  if (!transfer) {
    return new Response(
      JSON.stringify({ error: `No transfer found with reference ${reference}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    );
  }
  
  console.log('Found transfer:', transfer);
  
  // Update the transfer status to completed
  if (transfer.status !== 'completed') {
    const { error: updateError } = await supabase
      .from('bank_transfers')
      .update({ 
        status: 'completed',
        processed: true,
        processed_at: new Date().toISOString()
      })
      .eq('id', transfer.id);
      
    if (updateError) {
      console.error('Error updating transfer:', updateError.message);
      return new Response(
        JSON.stringify({ error: `Error updating transfer: ${updateError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log('Transfer updated to completed');
  }
  
  // Check for existing wallet transaction
  const { data: existingTx, error: txError } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('amount', transfer.amount)
    .ilike('description', `%${reference}%`)
    .eq('status', 'completed')
    .maybeSingle();
    
  if (txError) {
    console.error('Error checking wallet transactions:', txError.message);
  }
  
  // Create wallet transaction if it doesn't exist
  if (!existingTx) {
    const { error: insertError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        amount: transfer.amount,
        type: 'deposit',
        description: `Virement bancaire (${reference})`,
        status: 'completed',
        receipt_confirmed: true
      });
      
    if (insertError) {
      console.error('Error creating wallet transaction:', insertError.message);
      return new Response(
        JSON.stringify({ error: `Error creating wallet transaction: ${insertError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log('Wallet transaction created');
  }
  
  // Update wallet balance
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', userId)
    .single();
    
  if (profileError) {
    console.error('Error fetching profile:', profileError.message);
    return new Response(
      JSON.stringify({ error: `Error fetching profile: ${profileError.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
  
  console.log('Current wallet balance:', profile.wallet_balance);
  
  // Update wallet balance
  const { error: rpcError } = await supabase.rpc('increment_wallet_balance', {
    user_id: userId,
    increment_amount: transfer.amount
  });
  
  if (rpcError) {
    console.error('Error updating wallet balance:', rpcError.message);
    
    // Fallback to direct update
    const newBalance = (profile.wallet_balance || 0) + transfer.amount;
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating wallet balance directly:', updateError.message);
      return new Response(
        JSON.stringify({ error: `Error updating wallet balance: ${updateError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log(`Wallet balance updated directly to ${newBalance}`);
  }
  
  // Create a notification
  const { error: notificationError } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'deposit',
      title: 'Dépôt reçu (corrigé)',
      message: `Votre dépôt de ${transfer.amount}€ (réf: ${reference}) a été confirmé et ajouté à votre portefeuille.`,
      data: {
        amount: transfer.amount,
        reference: reference,
        category: 'success',
        timestamp: new Date().toISOString()
      },
      seen: false
    });
    
  if (notificationError) {
    console.error('Error creating notification:', notificationError.message);
  } else {
    console.log('Notification created');
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Dépôt de ${transfer.amount}€ (réf: ${reference}) correctement crédité` 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  );
}
