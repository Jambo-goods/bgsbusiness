
/**
 * Utility functions for investment calculations
 */

/**
 * Calculate monthly and total returns for an investment
 */
export const calculateReturns = (
  investmentAmount: number, 
  yieldRate: number, 
  duration: number,
  firstPaymentDelay: number
) => {
  // Le rendement mensuel est le montant d'investissement multiplié par le taux annuel divisé par 12
  const monthlyReturn = (investmentAmount * yieldRate / 100) / 12;
  const effectiveDuration = duration - firstPaymentDelay;
  const totalReturn = investmentAmount + (monthlyReturn * Math.max(0, effectiveDuration));
  
  return { monthlyReturn, totalReturn };
};

/**
 * Get total payments received based on wallet transaction data
 */
export const getFixedTotalPaymentsReceived = async (userId?: string) => {
  if (!userId) {
    console.log("No user ID provided for getFixedTotalPaymentsReceived");
    return 0;
  }
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Log for debugging
    console.log(`Getting total payments received for user: ${userId}`);
    
    // Query wallet transactions of type 'yield' with status 'completed'
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'yield')
      .eq('status', 'completed');
      
    if (error) {
      console.error('Error fetching yield transactions:', error);
      return 0;
    }
    
    // Sum all yield transaction amounts
    const total = data.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    console.log(`Total payments received for user ${userId}: ${total}€`);
    
    return total;
  } catch (err) {
    console.error('Error calculating total payments received:', err);
    return 0;
  }
};

/**
 * Calculate payment amount based on investment amount and percentage
 */
export const calculatePaymentAmount = (investmentAmount: number, percentage: number) => {
  return (investmentAmount * percentage) / 100;
};

/**
 * Send a notification to the user about a yield payment
 */
export const sendYieldNotification = async (userId: string, amount: number, projectName: string) => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Get user email information
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email, first_name')
      .eq('id', userId)
      .single();
      
    if (userError || !userData) {
      console.error('Error fetching user data for notification:', userError);
      return false;
    }
    
    console.log(`Sending yield notification to ${userData.email} for ${amount}€ from ${projectName}`);
    
    // Call the Supabase Edge Function to send email notification
    const { error } = await supabase.functions.invoke('send-user-notification', {
      body: {
        userEmail: userData.email,
        userName: userData.first_name || 'Investisseur',
        subject: `Rendement reçu: ${amount}€ pour ${projectName}`,
        eventType: 'yield',
        data: {
          amount: amount,
          projectName: projectName,
          status: 'completed'
        }
      }
    });
    
    if (error) {
      console.error('Error sending yield notification:', error);
      return false;
    }
    
    console.log(`Successfully sent yield notification to ${userData.email}`);
    return true;
  } catch (error) {
    console.error("Error in sendYieldNotification:", error);
    return false;
  }
};

/**
 * Process payment by updating wallet balance
 * This function creates a wallet transaction and updates the user's wallet balance
 */
export const processPaymentToWallet = async (userId: string, amount: number, paymentId: string, projectName: string) => {
  if (!userId || !amount) {
    console.error("Missing required data for processing payment", { userId, amount });
    return false;
  }
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    console.log(`Processing payment to wallet: user=${userId}, amount=${amount}, paymentId=${paymentId}`);
    
    // First check if this payment was already processed
    const { data: existingTransaction, error: checkError } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('payment_id', paymentId)
      .eq('status', 'completed')
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking existing transaction:", checkError);
      return false;
    }
      
    if (existingTransaction) {
      console.log(`Payment ${paymentId} was already processed, skipping`);
      return true; // Already processed successfully
    }
    
    // Create a wallet transaction for the payment
    const { error: txError } = await supabase.from('wallet_transactions').insert({
      user_id: userId,
      amount: amount,
      type: 'yield',
      description: `Rendement automatique: ${projectName || 'Investissement'}`,
      status: 'completed',
      receipt_confirmed: true,
      payment_id: paymentId
    });
    
    if (txError) {
      console.error("Failed to create wallet transaction:", txError);
      return false;
    }
    
    // Update wallet balance directly using RPC function
    const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
      user_id: userId,
      increment_amount: amount
    });
    
    if (balanceError) {
      console.error("Failed to update wallet balance:", balanceError);
      return false;
    }
    
    console.log(`Successfully credited ${amount}€ to wallet of user ${userId} from payment ${paymentId}`);
    
    // Send notification about the yield payment
    await sendYieldNotification(userId, amount, projectName);
    
    return true;
  } catch (error) {
    console.error("Error processing payment to wallet:", error);
    return false;
  }
};
