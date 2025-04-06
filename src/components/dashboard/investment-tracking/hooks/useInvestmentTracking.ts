
import { useState, useEffect } from "react";
import { Investment, Transaction } from "../types/investment";
import { fetchInvestmentDetails, fetchTransactionHistory } from "../utils/fetchInvestmentData";

export function useInvestmentTracking(investmentId: string | undefined) {
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      if (!investmentId) return;
      
      try {
        setLoading(true);
        const investmentData = await fetchInvestmentDetails(investmentId);
        
        if (investmentData) {
          setInvestment(investmentData);
          
          // Once we have the investment data, fetch transactions for this user
          const transactionsData = await fetchTransactionHistory(investmentData.user_id);
          
          // Convert any string types to the correct union type
          const typedTransactions = transactionsData.map(tx => ({
            ...tx,
            type: tx.type === 'yield' || tx.type === 'investment' 
              ? tx.type as 'yield' | 'investment'
              : 'yield' // Default fallback
          }));
          
          setTransactions(typedTransactions);
        }
      } catch (error) {
        console.error("Error loading investment tracking data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [investmentId]);

  // Function to refresh data
  const refreshData = async () => {
    if (!investmentId || !investment) return;
    
    try {
      setIsRefreshing(true);
      
      // Fetch updated investment details
      const updatedInvestment = await fetchInvestmentDetails(investmentId);
      
      if (updatedInvestment) {
        setInvestment(updatedInvestment);
        
        // Refresh transactions too
        const updatedTransactions = await fetchTransactionHistory(updatedInvestment.user_id);
        
        const typedTransactions = updatedTransactions.map(tx => ({
          ...tx,
          type: tx.type === 'yield' || tx.type === 'investment' 
            ? tx.type as 'yield' | 'investment'
            : 'yield' // Default fallback
        }));
        
        setTransactions(typedTransactions);
      }
    } catch (error) {
      console.error("Error refreshing investment tracking data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    investment,
    transactions,
    loading,
    isRefreshing,
    refreshData
  };
}
