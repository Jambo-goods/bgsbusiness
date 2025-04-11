
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
    let query = supabase.from('scheduled_payments').select('*');
    
    // If a specific payment ID was provided, only get that one
    if (paymentId) {
      query = query.eq('id', paymentId);
    } else if (projectId) {
      // If a specific project ID was provided, get all payments for that project
      query = query.eq('project_id', projectId);
    }
    
    // Only get 'paid' payments by default
    query = query.eq('status', 'paid');
    
    // If not forcing refresh, only get payments that haven't been processed
    if (!forceRefresh) {
      query = query.is('processed_at', null);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching payments:', error);
      return { payments: null, error };
    }
    
    let filteredPayments = data || [];
    
    // If processing all payments is not enabled and no specific IDs were provided, 
    // only return the first unprocessed payment
    if (!processAll && !paymentId && !projectId) {
      filteredPayments = filteredPayments.slice(0, 1);
    }
    
    return { payments: filteredPayments, error: null };
  } catch (err) {
    console.error('Exception in fetchPayments:', err);
    return { payments: null, error: err };
  }
}

// Fetch project details by ID
export async function fetchProject(supabase: SupabaseClient, projectId: string) {
  try {
    console.log(`Fetching project with ID: ${projectId}`);
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      return { project: null, error };
    }
    
    console.log(`Project details:`, data);
    
    return { project: data, error: null };
  } catch (err) {
    console.error(`Exception in fetchProject for ${projectId}:`, err);
    return { project: null, error: err };
  }
}

// Fetch all investments for a project
export async function fetchInvestments(supabase: SupabaseClient, projectId: string) {
  try {
    console.log(`Fetching investments for project ${projectId}`);
    
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) {
      console.error(`Error fetching investments for project ${projectId}:`, error);
      return { investments: null, error };
    }
    
    console.log(`Found ${data?.length || 0} investments for project ${projectId}`);
    
    // Log investment statuses
    if (data && data.length > 0) {
      const statuses = {};
      data.forEach(investment => {
        statuses[investment.status] = (statuses[investment.status] || 0) + 1;
      });
      console.log("Investment statuses:", statuses);
    }
    
    return { investments: data || [], error: null };
  } catch (err) {
    console.error(`Exception in fetchInvestments for ${projectId}:`, err);
    return { investments: [], error: err };
  }
}

// Mark a payment as processed
export async function markPaymentAsProcessed(
  supabase: SupabaseClient,
  paymentId: string,
  investorsProcessed: number,
  investments: any[] | null,
  project: any,
  percentage: number
) {
  try {
    console.log(`Marking payment ${paymentId} as processed with ${investorsProcessed} investors`);
    
    // Update the payment record to mark it as processed
    const { error } = await supabase
      .from('scheduled_payments')
      .update({
        processed_at: new Date().toISOString(),
        investors_count: investments?.length || 0,
        total_invested_amount: investments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
      })
      .eq('id', paymentId);
    
    if (error) {
      console.error(`Error marking payment ${paymentId} as processed:`, error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`Exception in markPaymentAsProcessed for ${paymentId}:`, err);
    return false;
  }
}

// Check if a transaction already exists for this payment and user
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
      .eq('description', `Rendement ${paymentId}`)
      .eq('type', 'yield')
      .limit(1);
    
    if (error) {
      console.error(`Error checking existing transaction for user ${userId}:`, error);
      return { exists: false, error };
    }
    
    return { exists: data && data.length > 0, error: null };
  } catch (err) {
    console.error(`Exception in checkExistingTransaction for user ${userId}:`, err);
    return { exists: false, error: err };
  }
}

// Update user's wallet balance
export async function updateWalletBalance(
  supabase: SupabaseClient,
  userId: string,
  amount: number
) {
  try {
    // Call the SQL function to increment the balance
    const { data, error } = await supabase.rpc(
      'increment_wallet_balance',
      { user_id: userId, increment_amount: amount }
    );
    
    if (error) {
      console.error(`Error updating wallet balance for user ${userId}:`, error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (err) {
    console.error(`Exception in updateWalletBalance for user ${userId}:`, err);
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
        description: `Rendement ${paymentId}`,
        status: 'completed',
        receipt_confirmed: true,
        data: {
          project_id: projectId,
          project_name: projectName,
          payment_id: paymentId,
          percentage: percentage
        }
      })
      .select()
      .single();
    
    if (error) {
      console.error(`Error creating transaction for user ${userId}:`, error);
      return { transaction: null, error };
    }
    
    return { transaction: data, error: null };
  } catch (err) {
    console.error(`Exception in createTransaction for user ${userId}:`, err);
    return { transaction: null, error: err };
  }
}

// Create notification for the user
export async function createNotification(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  projectName: string,
  paymentId: string,
  projectId: string
) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: "Rendement reçu",
        message: `Vous avez reçu un rendement de ${amount}€ pour votre investissement dans ${projectName}.`,
        type: "yield",
        seen: false,
        data: {
          project_id: projectId,
          project_name: projectName,
          payment_id: paymentId,
          amount: amount,
          category: "success"
        }
      })
      .select()
      .single();
    
    if (error) {
      console.error(`Error creating notification for user ${userId}:`, error);
      return { notification: null, error };
    }
    
    return { notification: data, error: null };
  } catch (err) {
    console.error(`Exception in createNotification for user ${userId}:`, err);
    return { notification: null, error: err };
  }
}
