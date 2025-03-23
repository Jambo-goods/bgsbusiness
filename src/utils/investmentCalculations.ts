
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
 * This replaces the fixed approach with a dynamic calculation
 */
export const getFixedTotalPaymentsReceived = async (userId?: string) => {
  if (!userId) return 0;
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
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
