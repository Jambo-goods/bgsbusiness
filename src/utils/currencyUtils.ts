
/**
 * Format a number as a currency string
 * @param amount The amount to format
 * @param currency The currency code to use (default: EUR)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string, currency = "EUR") => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return "0,00 €";
  }
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(numAmount);
};
