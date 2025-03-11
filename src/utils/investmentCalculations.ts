
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
  const monthlyReturn = investmentAmount * (yieldRate / 100);
  const effectiveDuration = duration - firstPaymentDelay;
  const totalReturn = investmentAmount + (monthlyReturn * Math.max(0, effectiveDuration));
  
  return { monthlyReturn, totalReturn };
};
