
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
  
  // Calculate the total amount from all completed yield transactions
  const total = transactions
    .filter(tx => tx.type === 'yield' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  return total;
};

/**
 * Calculate total earnings for a specific investment
 */
export const calculateInvestmentEarnings = (
  transactions: any[],
  investmentId: string
): number => {
  if (!transactions || transactions.length === 0 || !investmentId) return 0;
  
  // Filter transactions to only include those related to the specific investment
  return transactions
    .filter(tx => 
      tx.investment_id === investmentId && 
      tx.type === 'yield' && 
      tx.status === 'completed'
    )
    .reduce((sum, tx) => sum + tx.amount, 0);
};
