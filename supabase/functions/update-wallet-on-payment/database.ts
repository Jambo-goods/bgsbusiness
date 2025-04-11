
// Database operations for the update-wallet-on-payment function
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Check if a transaction exists for this payment and user
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
      .eq('description', `Rendement (${paymentId})`)
      .eq('type', 'yield')
      .limit(1);
    
    return {
      exists: data && data.length > 0,
      error,
      transactionId: data && data.length > 0 ? data[0].id : null
    };
  } catch (err) {
    console.error("Error checking existing transaction:", err);
    return { exists: false, error: err, transactionId: null };
  }
}

// Update user's wallet balance
export async function updateWalletBalance(
  supabase: SupabaseClient,
  userId: string,
  amount: number
) {
  try {
    if (amount <= 0) {
      console.log(`Skipping wallet balance update for user ${userId}: amount is ${amount}`);
      return { success: false, error: new Error("Amount must be greater than 0") };
    }

    const { data, error } = await supabase.rpc(
      'increment_wallet_balance',
      { user_id: userId, increment_amount: amount }
    );
    
    if (error) {
      throw error;
    }
    
    console.log(`Successfully updated wallet balance for user ${userId} with amount ${amount}`);
    return { success: true, error: null };
  } catch (err) {
    console.error(`Error updating wallet balance for user ${userId}:`, err);
    return { success: false, error: err };
  }
}

// Create transaction record
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
    // Create transaction record
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'yield',
        description: `Rendement (${paymentId})`,
        status: 'completed',
        receipt_confirmed: true
      })
      .select()
      .single();
    
    return {
      transaction: data,
      error
    };
  } catch (err) {
    console.error(`Error creating transaction for user ${userId}:`, err);
    return { transaction: null, error: err };
  }
}

// Create notification for user
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
          amount,
          project_id: projectId,
          payment_id: paymentId,
          project_name: projectName,
          category: "success"
        }
      })
      .select()
      .single();
    
    return {
      notification: data,
      error
    };
  } catch (err) {
    console.error(`Error creating notification for user ${userId}:`, err);
    return { notification: null, error: err };
  }
}

// Fetch payments for processing
export async function fetchPayments(
  supabase: SupabaseClient, 
  paymentId: string | undefined,
  projectId: string | undefined,
  processAll: boolean = false,
  forceRefresh: boolean = false
) {
  try {
    let query = supabase
      .from('scheduled_payments')
      .select('*');
    
    if (paymentId) {
      query = query.eq('id', paymentId);
    } else if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    if (!processAll) {
      query = query.eq('status', 'paid');
      
      if (!forceRefresh) {
        query = query.is('processed_at', null);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching payments:", error);
      return { payments: null, error };
    }
    
    return { payments: data, error: null };
  } catch (err) {
    console.error("Error in fetchPayments:", err);
    return { payments: null, error: err };
  }
}

// Fetch project details
export async function fetchProject(
  supabase: SupabaseClient,
  projectId: string
) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      return { project: null, error };
    }
    
    return { project: data, error: null };
  } catch (err) {
    console.error(`Error in fetchProject for ${projectId}:`, err);
    return { project: null, error: err };
  }
}

// Enhanced: Fetch investments for a project with improved error handling and logging
export async function fetchInvestments(
  supabase: SupabaseClient,
  projectId: string
) {
  try {
    console.log(`Fetching investments for project ${projectId}`);
    
    // First check if the project exists
    const { project, error: projectError } = await fetchProject(supabase, projectId);
    if (projectError) {
      console.error(`Project ${projectId} not found or error fetching it:`, projectError);
    } else {
      console.log(`Project ${projectId} found: ${project.name}`);
    }
    
    // Get all investments for this project with status 'active'
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'active');
    
    if (error) {
      console.error(`Error fetching investments for project ${projectId}:`, error);
      return { investments: null, error };
    }
    
    console.log(`Found ${data?.length || 0} active investments for project ${projectId}`);
    
    if (!data || data.length === 0) {
      // If no active investments found, check if there are ANY investments for this project
      // maybe they have a different status
      const { data: allInvestments, error: allInvError } = await supabase
        .from('investments')
        .select('id, status, amount, user_id')
        .eq('project_id', projectId);
      
      if (!allInvError && allInvestments && allInvestments.length > 0) {
        console.log(`Found ${allInvestments.length} total investments with various statuses for project ${projectId}:`);
        const statuses = {};
        allInvestments.forEach(inv => {
          statuses[inv.status] = (statuses[inv.status] || 0) + 1;
        });
        console.log('Investment statuses:', statuses);
      } else {
        console.log(`No investments at all found for project ${projectId}`);
      }
    }
    
    return { investments: data || [], error: null };
  } catch (err) {
    console.error(`Error in fetchInvestments for project ${projectId}:`, err);
    return { investments: null, error: err };
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
    const { data, error } = await supabase
      .from('scheduled_payments')
      .update({
        processed_at: new Date().toISOString(),
        investors_count: investments.length || 0
      })
      .eq('id', paymentId);
    
    if (error) {
      console.error(`Error marking payment ${paymentId} as processed:`, error);
      return { success: false, error };
    }
    
    console.log(`Payment ${paymentId} marked as processed with ${processedCount} investors processed`);
    return { success: true, error: null };
  } catch (err) {
    console.error(`Error in markPaymentAsProcessed for ${paymentId}:`, err);
    return { success: false, error: err };
  }
}

