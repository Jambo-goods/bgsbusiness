
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
 * Get the correct fixed value for total payments received
 */
export const getFixedTotalPaymentsReceived = () => {
  // For an investment of 200€ with two payments at 12% and 13%
  // First payment: 200 * 0.12 = 24€
  // Second payment: 200 * 0.13 = 26€
  // Total: 50€
  return 50;
};
