
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
    const { userId, reference } = await req.json();
    
    if (!userId || !reference) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: userId and reference' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
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
    
    // Check if the transfer is already completed
    if (transfer.status !== 'completed') {
      // Update the transfer status to completed
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
    } else {
      console.log('Transfer is already completed');
    }
    
    // Check if there's already a wallet transaction for this transfer
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
    
    if (existingTx) {
      console.log('Wallet transaction already exists:', existingTx);
    } else {
      // Create a new wallet transaction
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
    
    // Update the user's wallet balance
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
    
    // Use the RPC function to update the wallet balance
    const { error: rpcError } = await supabase.rpc('increment_wallet_balance', {
      user_id: userId,
      increment_amount: transfer.amount
    });
    
    if (rpcError) {
      console.error('Error updating wallet balance via RPC:', rpcError.message);
      
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
    } else {
      console.log(`Wallet balance updated via RPC by adding ${transfer.amount}`);
    }
    
    // Create a notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'wallet_deposit',
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
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
