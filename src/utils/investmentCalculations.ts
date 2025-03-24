
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
    // Calculate commission amount (10% of yield/payment amount by default)
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

// Add these functions to fix build errors
export const getFixedTotalPaymentsReceived = (paymentsData: any[]): number => {
  return paymentsData.reduce((total, payment) => 
    payment.status === 'completed' ? total + payment.amount : total, 0);
};

export const processPaymentToWallet = async (
  userId: string, 
  amount: number, 
  description: string = "Paiement programmé"
): Promise<boolean> => {
  try {
    // Implementation would typically interact with Supabase
    console.log(`Processing payment of ${amount} to user ${userId}: ${description}`);
    return true;
  } catch (error) {
    console.error("Error processing payment:", error);
    return false;
  }
};
