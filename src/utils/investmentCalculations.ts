// Fix the excessive type depth issue by simplifying the return type
export type ReferralCommissionResult = {
  amount: number;
  referrerId: string | null;
  success: boolean;
  error?: string;
};

export const calculateReferralCommission = (
  yieldAmount: number,
  referrerId: string | null,
  commissionRate: number = 0.1
): ReferralCommissionResult => {
  // If there's no referrer, return a zero commission
  if (!referrerId) {
    return {
      amount: 0,
      referrerId: null,
      success: false,
      error: "No referrer ID provided"
    };
  }

  try {
    // Calculate commission amount (10% of yield by default)
    const commissionAmount = yieldAmount * commissionRate;
    
    return {
      amount: commissionAmount,
      referrerId,
      success: true
    };
  } catch (error) {
    console.error("Error calculating referral commission:", error);
    return {
      amount: 0,
      referrerId,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

export const calculateTotalYield = (amount: number, yieldRate: number, duration: number): number => {
  return amount * (yieldRate / 100) * (duration / 12);
};
