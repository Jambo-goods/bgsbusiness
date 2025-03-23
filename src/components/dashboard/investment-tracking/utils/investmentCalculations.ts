
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
 * Calculate total earnings for a specific investment from transactions
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

/**
 * Calculate total earnings for a specific investment from scheduled payments
 * This is a more reliable method when direct transaction data is unavailable
 */
export const calculateEarningsFromScheduledPayments = (
  scheduledPayments: any[],
  projectId: string,
  investmentAmount: number = 200
): number => {
  if (!scheduledPayments || scheduledPayments.length === 0 || !projectId) return 0;
  
  // Filter payments to only include those related to the specific project and paid status
  const paidPayments = scheduledPayments
    .filter(payment => payment.project_id === projectId && payment.status === 'paid');
    
  if (paidPayments.length === 0) {
    return 0;
  }
  
  // Calculate the total from actual paid payments
  return paidPayments.reduce((sum, payment) => {
    // If payment has a specific amount, use that
    if (payment.amount) return sum + payment.amount;
    
    // For payments that don't have a specific amount, we can try to calculate it
    // based on percentage and investment amount
    if (payment.percentage) {
      return sum + (investmentAmount * (payment.percentage / 100));
    }
    
    return sum;
  }, 0);
};

/**
 * Sum the payments directly from the transaction history data
 * This should be the most accurate method when we have the transaction table data
 */
export const sumTransactionTableData = (tableData: any[]): number => {
  if (!tableData || tableData.length === 0) return 0;
  
  // Sum the amounts of all transactions (should match what is displayed in the UI table)
  return tableData.reduce((sum, tx) => sum + tx.amount, 0);
};
