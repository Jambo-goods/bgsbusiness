// Function to calculate expected yield
export const calculateExpectedYield = (amount: number, yieldRate: number, months: number): number => {
  // Convert percent to decimal: 7% -> 0.07
  const yieldDecimal = yieldRate / 100;
  
  // Calculate monthly yield
  const monthlyYield = amount * yieldDecimal / 12;
  
  // Calculate total yield over specified months
  return monthlyYield * months;
};

// Function to format currency amount
export const formatCurrency = (amount: number | string, currency: string = "EUR", locale: string = "fr-FR"): string => {
  // Ensure amount is a number
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(numAmount);
};
