
// Database interaction functions
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Fetch payments that need processing
export async function fetchPayments(
  supabase: SupabaseClient,
  paymentId?: string,
  projectId?: string,
  processAll = false,
  forceRefresh = false
) {
  try {
    let query = supabase
      .from('scheduled_payments')
      .select('*')
      .eq('status', 'paid');
    
    if (!processAll && paymentId) {
      query = query.eq('id', paymentId);
    }
    
    if (!processAll && projectId) {
      query = query.eq('project_id', projectId);
    }
    
    // Only get payments that haven't been processed yet or force refresh
    if (!forceRefresh) {
      query = query.is('processed_at', null);
    }
    
    const { data, error } = await query;
    
    return { payments: data, error };
  } catch (err) {
    console.error('Error in fetchPayments:', err);
    return { payments: [], error: err };
  }
}

// Fetch project details
export async function fetchProject(supabase: SupabaseClient, projectId: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    return { project: data, error };
  } catch (err) {
    console.error(`Error in fetchProject for ${projectId}:`, err);
    return { project: null, error: err };
  }
}

// Fetch investments for a project
export async function fetchInvestments(supabase: SupabaseClient, projectId: string) {
  try {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'active');
      
    return { investments: data, error };
  } catch (err) {
    console.error(`Error in fetchInvestments for project ${projectId}:`, err);
    return { investments: [], error: err };
  }
}

// Check if a yield transaction already exists
export async function checkExistingTransaction(
  supabase: SupabaseClient,
  userId: string,
  paymentId: string,
  projectId: string
) {
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('payment_id', paymentId)
      .eq('project_id', projectId)
      .eq('type', 'yield')
      .maybeSingle();
      
    if (error) {
      console.error(`Error checking existing transaction:`, error);
      return { exists: false, error };
    }
      
    return { exists: !!data, transaction: data, error: null };
  } catch (err) {
    console.error(`Error in checkExistingTransaction:`, err);
    return { exists: false, error: err };
  }
}

// Update a user's wallet balance
export async function updateWalletBalance(supabase: SupabaseClient, userId: string, amount: number) {
  try {
    const { error } = await supabase.rpc('increment_wallet_balance', {
      user_id: userId,
      increment_amount: amount
    });
    
    return { success: !error, error };
  } catch (err) {
    console.error(`Error in updateWalletBalance for user ${userId}:`, err);
    return { success: false, error: err };
  }
}

// Create a wallet transaction record
export async function createTransaction(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  projectName: string,
  percentage: number,
  paymentId: string,
  projectId: string
) {
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'yield',
        description: `Rendement ${projectName} (${percentage}%)`,
        status: 'completed',
        receipt_confirmed: true,
        payment_id: paymentId,
        project_id: projectId
      });
      
    return { transaction: data, error };
  } catch (err) {
    console.error(`Error in createTransaction for user ${userId}:`, err);
    return { transaction: null, error: err };
  }
}

// Create a notification for the user
export async function createNotification(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  projectName: string,
  paymentId: string,
  projectId: string
) {
  try {
    const { data, error } = await supabase.from('notifications').insert({
      user_id: userId,
      title: "Rendement reçu",
      message: `Vous avez reçu un rendement de ${amount}€ pour le projet ${projectName}`,
      type: "yield",
      seen: false,
      data: {
        payment_id: paymentId,
        project_id: projectId,
        amount: amount,
        category: "success"
      }
    });
    
    return { notification: data, error };
  } catch (err) {
    console.error(`Error in createNotification for user ${userId}:`, err);
    return { notification: null, error: err };
  }
}

// Mark a payment as processed
export async function markPaymentAsProcessed(
  supabase: SupabaseClient,
  paymentId: string,
  processedCount: number,
  investments: any[],
  project: any,
  percentage: number
) {
  try {
    // Simplified update with only processed_at field
    const { error } = await supabase
      .from('scheduled_payments')
      .update({ 
        processed_at: new Date().toISOString()
      })
      .eq('id', paymentId);
      
    if (error) {
      console.error(`Error marking payment ${paymentId} as processed:`, error);
      return { success: false, error };
    } else {
      console.log(`Payment ${paymentId} marked as processed with ${processedCount} investors processed`);
      return { success: true, error: null };
    }
  } catch (err) {
    console.error(`Error in markPaymentAsProcessed for payment ${paymentId}:`, err);
    return { success: false, error: err };
  }
}
