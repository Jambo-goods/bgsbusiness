
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
    const endDate = new Date(investment.end_date || startDate); // Provide fallback
    const today = new Date();
    
    // Calculate total duration and remaining duration in months
    const totalMonths = investment.duration || 12; // Provide fallback
    
    // Calculate elapsed months (capped at total duration)
    const elapsedMonths = Math.min(
      Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)),
      totalMonths
    );
    
    const remainingDuration = Math.max(0, totalMonths - elapsedMonths);
    
    // Fetch user data if needed for the investment
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', investment.user_id)
      .single();
    
    if (userError) {
      console.error("Error fetching user data for investment:", userError);
    }
    
    return {
      ...investment,
      remainingDuration,
      user_first_name: userData?.first_name || '',
      user_last_name: userData?.last_name || '',
      user_id: investment.user_id || '',
      duration: investment.duration || 12
    };
  } catch (error) {
    console.error("Unexpected error in fetchInvestmentData:", error);
    return null;
  }
}

// Add these functions to fix the build errors
export async function fetchInvestmentDetails(investmentId: string): Promise<Investment | null> {
  try {
    return await fetchInvestmentData(investmentId);
  } catch (error) {
    console.error("Error in fetchInvestmentDetails:", error);
    return null;
  }
}

export async function fetchTransactionHistory(userId: string): Promise<Transaction[]> {
  try {
    // Fetch all wallet transactions with investment, deposit, and withdrawal operations
    const { data: walletTransactions, error: walletError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (walletError) {
      console.error("Error fetching wallet transactions:", walletError);
      return [];
    }
    
    // Create a map of investment transactions to avoid duplicates
    const investmentMap = new Map();
    
    // Format the transactions for display
    const formattedTransactions = walletTransactions.map(tx => {
      // Set the type based on the wallet transaction type or description
      let type = tx.type;
      
      // Check if it's an investment (for backward compatibility)
      if (tx.description && tx.description.toLowerCase().includes('investissement')) {
        type = 'investment';
        
        // Track this investment to avoid duplicates
        const projectNameMatch = tx.description.match(/Investissement dans (.+)/);
        if (projectNameMatch && projectNameMatch[1]) {
          investmentMap.set(projectNameMatch[1].trim(), true);
        }
      }
      
      // Check if it's a yield payment
      if (tx.type === 'deposit' && tx.description && tx.description.toLowerCase().includes('rendement')) {
        type = 'yield';
      }
      
      return {
        id: tx.id,
        user_id: tx.user_id || userId,
        created_at: tx.created_at,
        amount: tx.amount,
        type: type,
        description: tx.description || '',
        status: tx.status || 'completed',
        receipt_confirmed: tx.receipt_confirmed || false
      };
    });
    
    // Now fetch investments not already in wallet transactions
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select(`
        *,
        projects (name)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });
      
    if (!investmentsError && investments && investments.length > 0) {
      // Add only investments that don't exist in wallet transactions
      investments.forEach(inv => {
        const projectName = inv.projects?.name || '';
        
        if (!investmentMap.has(projectName)) {
          formattedTransactions.push({
            id: `inv-${inv.id}`,
            user_id: userId,
            created_at: inv.date || new Date().toISOString(),
            amount: inv.amount || 0,
            type: 'investment',
            description: `Investissement dans ${projectName || 'un projet'}`,
            status: 'completed',
            receipt_confirmed: true
          });
        }
      });
    }
    
    // Sort transactions by date (newest first) and remove any potential duplicates
    return formattedTransactions
      .filter((transaction, index, self) => 
        index === self.findIndex((t) => t.id === transaction.id)
      )
      .sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  } catch (error) {
    console.error("Unexpected error in fetchTransactionHistory:", error);
    return [];
  }
}
