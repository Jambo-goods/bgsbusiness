
/**
 * Calculate the monthly yield from an investment based on the investment amount and yield percentage
 */
export const calculateMonthlyYield = (
  investmentAmount: number, 
  yieldPercentage: number
): number => {
  // Convert annual yield percentage to monthly value
  const monthlyYieldPercentage = yieldPercentage / 12;
  
  // Calculate monthly return based on investment amount and monthly yield percentage
  const monthlyReturn = investmentAmount * (monthlyYieldPercentage / 100);
  
  return monthlyReturn;
};

/**
 * Calculate total earnings from completed transactions
 */
export const calculateTotalEarnings = (
  transactions: any[]
): number => {
  if (!transactions || transactions.length === 0) return 0;
  
  return transactions
    .filter(tx => tx.type === 'yield' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);
};
