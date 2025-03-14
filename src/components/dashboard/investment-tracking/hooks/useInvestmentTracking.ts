
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
          setTransactions(transactionsData);
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
      const refreshedInvestment = await fetchInvestmentDetails(investmentId);
      
      if (refreshedInvestment) {
        setInvestment(refreshedInvestment);
        
        // Refresh transactions data
        const refreshedTransactions = await fetchTransactionHistory(refreshedInvestment.user_id);
        setTransactions(refreshedTransactions);
      }
    } catch (error) {
      console.error("Error refreshing investment data:", error);
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
