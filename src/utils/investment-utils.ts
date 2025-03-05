
import { InvestmentReturns } from "@/types/investment";

// Function to calculate expected returns
export const calculateReturns = (amount: number, yieldRate: number, duration: number): InvestmentReturns => {
  const monthlyYield = amount * (yieldRate / 100);
  const totalReturn = amount + (monthlyYield * duration);
  return {
    monthlyReturn: monthlyYield,
    totalReturn: totalReturn
  };
};
