
import { supabase } from "@/integrations/supabase/client";
import { Investment, Transaction } from "../types/investment";

export const fetchInvestmentDetails = async (investmentId: string) => {
  try {
    // Fetch investment with project details
    const { data, error } = await supabase
      .from("investments")
      .select(`
        *,
        projects (
          name,
          description,
          category,
          status,
          image,
          funding_progress,
          yield
        )
      `)
      .eq("id", investmentId)
      .single();
      
    if (error) throw error;
    
    // Calculate remaining duration
    if (data) {
      const investmentData = {...data};
      const startDate = new Date(investmentData.date);
      const endDate = new Date(startDate.setMonth(startDate.getMonth() + investmentData.duration));
      const remainingMonths = Math.max(0, Math.floor((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
      
      // Add calculated fields
      const enhancedData: any = {
        ...investmentData,
        remainingDuration: remainingMonths
      };
      
      // Fetch user information
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", data.user_id)
        .single();
        
      if (!userError && userData) {
        enhancedData.user_first_name = userData.first_name;
        enhancedData.user_last_name = userData.last_name;
      }
      
      return enhancedData as Investment;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching investment details:", error);
    return null;
  }
};

export const fetchTransactionHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    
    // Convert database transactions to the expected Transaction type
    const typedTransactions = data?.map(tx => ({
      ...tx,
      type: tx.type === 'yield' || tx.type === 'investment' 
        ? tx.type as 'yield' | 'investment'
        : 'yield' // Default fallback
    })) || [];
    
    return typedTransactions as Transaction[];
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return [];
  }
};
