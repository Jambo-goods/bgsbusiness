import { supabase } from "@/integrations/supabase/client";
import { Investment, Transaction } from "../types/investment";

export async function fetchInvestmentData(investmentId: string): Promise<Investment | null> {
  try {
    // Fetch the investment with the joined project
    const { data: investment, error } = await supabase
      .from('investments')
      .select(`
        *,
        projects (
          name,
          description,
          image,
          status,
          duration,
          yield,
          category,
          funding_progress
        )
      `)
      .eq('id', investmentId)
      .single();

    if (error) {
      console.error("Error fetching investment data:", error);
      return null;
    }

    if (!investment) {
      console.error("No investment found with ID:", investmentId);
      return null;
    }

    // Calculate remaining duration in months
    const startDate = new Date(investment.date);
    const endDate = new Date(investment.end_date);
    const today = new Date();
    
    // Calculate total duration and remaining duration in months
    const totalMonths = investment.duration;
    
    // Calculate elapsed months (capped at total duration)
    const elapsedMonths = Math.min(
      Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)),
      totalMonths
    );
    
    const remainingDuration = Math.max(0, totalMonths - elapsedMonths);
    
    return {
      ...investment,
      remainingDuration,
    };
  } catch (error) {
    console.error("Unexpected error in fetchInvestmentData:", error);
    return null;
  }
}

// Add these functions to fix the build errors
export async function fetchInvestmentDetails(investmentId: string): Promise<Investment | null> {
  return fetchInvestmentData(investmentId);
}

export async function fetchTransactionHistory(userId: string): Promise<any[]> {
  try {
    // First fetch wallet transactions related to investments
    const { data: walletData, error: walletError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .ilike('description', '%Investissement%')
      .order('created_at', { ascending: false });
      
    if (walletError) {
      console.error("Error fetching wallet transactions:", walletError);
      return [];
    }
    
    // Fetch yield payments
    const { data: yieldData, error: yieldError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'deposit')
      .ilike('description', '%rendement%')
      .order('created_at', { ascending: false });
      
    if (yieldError) {
      console.error("Error fetching yield transactions:", yieldError);
    }
    
    // Combine all transactions
    const allTransactions = [
      ...(walletData || []).map(tx => ({
        ...tx,
        type: 'investment'
      })),
      ...(yieldData || []).map(tx => ({
        ...tx,
        type: 'yield'
      }))
    ].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return allTransactions;
  } catch (error) {
    console.error("Unexpected error in fetchTransactionHistory:", error);
    return [];
  }
}
