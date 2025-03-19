
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Core Supabase client initialization
function createSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Attempt to update using database function
async function updateUsingDatabaseFunction(supabaseAdmin, transferId, newStatus) {
  try {
    const { data: functionData, error: functionError } = await supabaseAdmin.rpc(
      'force_bank_transfer_status',
      { 
        transfer_id: transferId, 
        new_status: newStatus || 'received'
      }
    );
    
    if (functionError) {
      return { success: false };
    } 
    
    if (functionData === true) {
      const { data: updatedTransfer } = await supabaseAdmin
        .from('bank_transfers')
        .select('status, user_id, amount, reference')
        .eq('id', transferId)
        .single();
        
      return {
        success: true,
        message: "Bank transfer successfully updated using database function",
        transfer: updatedTransfer
      };
    }
    
    return { success: false };
  } catch (error) {
    return { success: false };
  }
}

// Attempt to update using admin database function
async function updateUsingAdminFunction(supabaseAdmin, transferId, newStatus) {
  try {
    const { data: adminFnData, error: adminFnError } = await supabaseAdmin.rpc(
      'admin_update_bank_transfer',
      { 
        transfer_id: transferId, 
        new_status: newStatus || 'received',
        processed: true,
        notes: 'Forced update via Edge Function on ' + new Date().toLocaleString()
      }
    );
    
    if (adminFnError) {
      return { success: false };
    } 
    
    if (adminFnData === true) {
      const { data: updatedTransfer } = await supabaseAdmin
        .from('bank_transfers')
        .select('status, user_id, amount, reference')
        .eq('id', transferId)
        .single();
        
      return {
        success: true,
        message: "Bank transfer successfully updated using admin database function",
        transfer: updatedTransfer
      };
    }
    
    return { success: false };
  } catch (error) {
    return { success: false };
  }
}

// Fetch transfer data if not provided
async function fetchTransferData(supabaseAdmin, transferId, transferData) {
  if (transferData) return { success: true, data: transferData };
  
  try {
    const { data: fetchedData, error: fetchError } = await supabaseAdmin
      .from('bank_transfers')
      .select('*')
      .eq('id', transferId)
      .single();
      
    if (fetchError) {
      return {
        success: false,
        message: `Error fetching transfer data: ${fetchError.message}` 
      };
    }
    
    return { success: true, data: fetchedData };
  } catch (error) {
    return {
      success: false,
      message: `Error fetching transfer data: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
}

// Update wallet balance if requested
async function updateWalletBalance(supabaseAdmin, userId, amount) {
  if (!userId || !amount) return { success: false };
  
  try {
    // First get current balance
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      return { success: false };
    }
    
    // Calculate new balance
    const newBalance = (profile.wallet_balance || 0) + amount;
    
    // Update profile directly
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);
      
    return { success: !updateError };
  } catch (error) {
    return { success: false };
  }
}

// Recalculate wallet balance using DB function
async function recalculateWalletBalance(supabaseAdmin, userId) {
  if (!userId) return { success: false };
  
  try {
    await supabaseAdmin.rpc('recalculate_wallet_balance', {
      user_uuid: userId
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// Try to update using DELETE + INSERT approach
async function updateUsingReplaceMethod(supabaseAdmin, transferId, newStatus, fullTransfer) {
  try {
    // First, save a backup of the existing record
    const backupRecord = { ...fullTransfer };
    
    // Then modify the status for our insert
    const modifiedRecord = { 
      ...backupRecord,
      status: newStatus || 'received',
      processed: true,
      processed_at: new Date().toISOString(),
      notes: (backupRecord.notes || '') + ' | Force updated via Edge Function on ' + new Date().toLocaleString()
    };
    
    // First delete the existing record
    const { error: deleteError } = await supabaseAdmin
      .from('bank_transfers')
      .delete()
      .eq('id', transferId);
    
    if (deleteError) {
      return { success: false };
    }
    
    // Then insert the modified version
    const { error: insertError } = await supabaseAdmin
      .from('bank_transfers')
      .insert(modifiedRecord);
      
    if (insertError) {
      // Restore the original record if insertion failed
      await supabaseAdmin
        .from('bank_transfers')
        .insert(backupRecord);
      
      return { success: false };
    }
    
    // Verify the result
    const { data: checkData, error: checkError } = await supabaseAdmin
      .from('bank_transfers')
      .select('status, user_id, amount, reference')
      .eq('id', transferId)
      .single();
      
    if (checkError || checkData.status !== (newStatus || 'received')) {
      return { success: false };
    }
    
    return {
      success: true,
      message: "Bank transfer status updated using DELETE+INSERT approach",
      transfer: checkData
    };
  } catch (error) {
    return { success: false };
  }
}

// Try to update using direct SQL execution
async function updateUsingDirectSQL(supabaseAdmin, transferId, newStatus, notes) {
  try {
    const sqlCommand = `UPDATE bank_transfers 
                      SET status = '${newStatus || 'received'}', 
                          processed = true, 
                          processed_at = NOW(), 
                          notes = '${notes || ''} | Force updated via SQL on ${new Date().toLocaleString()}'
                      WHERE id = '${transferId}'`;
                      
    const { data: sqlData, error: sqlError } = await supabaseAdmin.rpc(
      'execute_admin_sql',
      { sql_command: sqlCommand }
    );
    
    if (sqlError) {
      return { success: false };
    }
    
    // Verify the update
    const { data: checkData, error: checkError } = await supabaseAdmin
      .from('bank_transfers')
      .select('status, user_id, amount, reference')
      .eq('id', transferId)
      .single();
      
    if (checkError || checkData.status !== (newStatus || 'received')) {
      return { success: false };
    }
    
    return {
      success: true,
      message: "Bank transfer status updated using direct SQL execution",
      transfer: checkData
    };
  } catch (error) {
    return { success: false };
  }
}

// Verify the final status of the transfer
async function verifyTransferStatus(supabaseAdmin, transferId, newStatus) {
  try {
    const { data: checkData, error: checkError } = await supabaseAdmin
      .from('bank_transfers')
      .select('status, user_id, amount, reference')
      .eq('id', transferId)
      .single();
      
    if (checkError) {
      return {
        success: false,
        message: `Error verifying update: ${checkError.message}`
      };
    }
    
    return {
      success: checkData.status === (newStatus || 'received'),
      message: checkData.status === (newStatus || 'received') 
        ? "Bank transfer successfully updated to received" 
        : `Failed to update status. Current status: ${checkData.status}`,
      userId: checkData.user_id,
      amount: checkData.amount,
      reference: checkData.reference
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { transferId, newStatus, forceWalletRecalculation, forceWalletUpdate, amount, userId, transferData } = await req.json();
    
    // Create Supabase client with service role key
    const supabaseAdmin = createSupabaseAdmin();
    
    // Try the first database function approach
    const dbFunctionResult = await updateUsingDatabaseFunction(supabaseAdmin, transferId, newStatus);
    if (dbFunctionResult.success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: dbFunctionResult.message,
          userId: dbFunctionResult.transfer?.user_id,
          amount: dbFunctionResult.transfer?.amount,
          reference: dbFunctionResult.transfer?.reference
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Try the admin database function approach
    const adminFunctionResult = await updateUsingAdminFunction(supabaseAdmin, transferId, newStatus);
    if (adminFunctionResult.success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: adminFunctionResult.message,
          userId: adminFunctionResult.transfer?.user_id,
          amount: adminFunctionResult.transfer?.amount,
          reference: adminFunctionResult.transfer?.reference
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the full record data if not already provided
    const fetchResult = await fetchTransferData(supabaseAdmin, transferId, transferData);
    if (!fetchResult.success) {
      return new Response(
        JSON.stringify({ success: false, message: fetchResult.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const fullTransfer = fetchResult.data;
    
    // Update wallet balance directly if requested
    if (forceWalletUpdate && userId && amount) {
      await updateWalletBalance(supabaseAdmin, userId, amount);
    }
    
    // Recalculate wallet balance if requested
    if (forceWalletRecalculation && fullTransfer.user_id) {
      await recalculateWalletBalance(supabaseAdmin, fullTransfer.user_id);
    }
    
    // Try the DELETE + INSERT approach
    const replaceResult = await updateUsingReplaceMethod(supabaseAdmin, transferId, newStatus, fullTransfer);
    if (replaceResult.success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: replaceResult.message,
          userId: replaceResult.transfer?.user_id,
          amount: replaceResult.transfer?.amount,
          reference: replaceResult.transfer?.reference
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Try direct SQL execution as last resort
    const sqlResult = await updateUsingDirectSQL(supabaseAdmin, transferId, newStatus, fullTransfer.notes);
    if (sqlResult.success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: sqlResult.message,
          userId: sqlResult.transfer?.user_id,
          amount: sqlResult.transfer?.amount,
          reference: sqlResult.transfer?.reference
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Final verification of the transfer status
    const verificationResult = await verifyTransferStatus(supabaseAdmin, transferId, newStatus);
    
    return new Response(
      JSON.stringify({
        success: verificationResult.success,
        message: verificationResult.message,
        userId: verificationResult.userId,
        amount: verificationResult.amount,
        reference: verificationResult.reference
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
